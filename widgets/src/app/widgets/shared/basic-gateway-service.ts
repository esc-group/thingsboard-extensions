import { AlarmService, AttributeService, DeviceService, EntityService } from '@core/public-api';
import {
  AlarmInfo,
  AlarmQuery,
  AliasFilterType,
  AttributeData,
  AttributeScope,
  EntityType,
  PersistentRpc,
  RpcStatus,
  TimePageLink,
} from '@shared/public-api';
import { interval, Observable, of } from 'rxjs';
import * as op from 'rxjs/operators';

const PERSISTENT_RPC_DELAY = 250; // milliseconds

export class BasicGatewayService {
  constructor(
    protected alarmService: AlarmService,
    protected attributeService: AttributeService,
    protected entityService: EntityService,
    protected deviceService: DeviceService
  ) {}

  getGatewayId(entityName: string): Observable<string> {
    return this.entityService
      .findSingleEntityInfoByEntityFilter({
        type: AliasFilterType.entityName,
        entityType: EntityType.DEVICE,
        entityNameFilter: entityName,
      })
      .pipe(
        op.first(),
        op.map((entityInfo) => entityInfo.id)
      );
  }

  getAlarmTypes(daysBackToCheck: number): Observable<string[]> {
    const startTime = new Date().getTime() - daysBackToCheck * 86_400_000;
    // WARNING: ThingsBoard's AlarmQuery class does not match JSON schema of Java Controller
    const pageLink = new TimePageLink(32, 0, undefined, undefined, startTime);
    const query = new AlarmQuery(undefined, pageLink, undefined, undefined, false);
    return this.alarmService.getAllAlarms(query).pipe(
      op.first(),
      op.map((pageData) => {
        const alarmTypesSet = new Set<string>();
        pageData.data.forEach((alarm: AlarmInfo) => alarmTypesSet.add(alarm.type));
        return Array.from(alarmTypesSet.values());
      })
    );
  }

  protected getSingleAttribute<T>(id: string, attributeName: string): Observable<T> {
    return this.attributeService
      .getEntityAttributes({ id: id, entityType: EntityType.DEVICE }, AttributeScope.CLIENT_SCOPE, [attributeName])
      .pipe(
        op.first(),
        op.map((attributeData: AttributeData[]) => {
          if (attributeData.length === 0) {
            throw new Error(`'${attributeName}' attribute not found`);
          } else {
            let value = attributeData[0].value;
            const isJsonValue = Boolean(
              typeof value === 'string' &&
                ((value[0] === '{' && value[value.length - 1] === '}') ||
                  (value[0] === '[' && value[value.length - 1] == ']'))
            );
            if (isJsonValue) value = JSON.parse(value);
            return value as T;
          }
        })
      );
  }

  protected setSingleAttribute(id: string, attributeName: string, value: any): Observable<any> {
    return this.attributeService
      .saveEntityAttributes({ id: id, entityType: EntityType.DEVICE }, AttributeScope.SHARED_SCOPE, [
        { key: attributeName, value: value },
      ])
      .pipe(op.first());
  }

  protected oneWayPersistentRpc(
    deviceId: string,
    method: string,
    params: object = {},
    timeout: number = 4e3 // milliseconds
  ): Observable<void> {
    const payload = { method, params, timeout, persistent: true };
    const start = new Date() as any as number;
    return this.deviceService.sendOneWayRpcCommand(deviceId, payload).pipe(
      op.first(),
      op.delay(PERSISTENT_RPC_DELAY),
      op.exhaustMap(({ rpcId }) =>
        this.deviceService.getPersistedRpc(rpcId).pipe(
          op.first(),
          /* rpc.status is QUEUED until it becomes DELIVERED */
          op.delayWhen(({ status }) => interval(status === RpcStatus.DELIVERED ? 0 : PERSISTENT_RPC_DELAY)),
          op.map(({ status }) => {
            if (status === RpcStatus.DELIVERED) {
              return; // bypasses retry below
            }
            throw new Error('engage retry below');
          }),
          op.retry({
            delay: () => {
              const elapsed = (new Date() as any as number) - start;
              if (timeout - elapsed > 0) {
                return of(null); // time left; retry
              }
              throw new Error('RPC timed out'); // time is up; do not retry
            },
          })
        )
      )
    );
  }

  protected twoWayPersistentRpc<T>(
    deviceId: string,
    method: string,
    params: object = {},
    timeout: number = 8e3 // milliseconds
  ): Observable<T> {
    const payload = { method, params, timeout, persistent: true };
    const start = new Date() as any as number;
    return this.deviceService.sendTwoWayRpcCommand(deviceId, payload).pipe(
      op.first(),
      op.delay(PERSISTENT_RPC_DELAY),
      op.exhaustMap((response) =>
        this.deviceService.getPersistedRpc(response.rpcId).pipe(
          op.first(),
          /* rpc.status is QUEUED until it becomes DELIVERED and then it becomes SUCCESSFUL */
          op.delayWhen(({ status }) => interval(status === RpcStatus.SUCCESSFUL ? 0 : PERSISTENT_RPC_DELAY)),
          op.map((rpc: PersistentRpc) => {
            if (rpc.status === RpcStatus.SUCCESSFUL) {
              return rpc.response as T; // bypasses retry below
            }
            throw new Error('engage retry below');
          }),
          op.retry({
            delay: () => {
              const elapsed = (new Date() as any as number) - start;
              if (timeout - elapsed > 0) {
                return of(null); // time left; retry
              }
              throw new Error('RPC timed out'); // time is up; do not retry
            },
          })
        )
      )
    );
  }
}
