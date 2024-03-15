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
  TimeseriesData,
} from '@shared/public-api';
import { interval, Observable, of } from 'rxjs';
import * as op from 'rxjs/operators';
import { BasicRpcResponse } from './models';

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

  protected getSingleTimeSeries<T>(id: string, attributeName: string): Observable<T> {
    return this.attributeService
      .getEntityTimeseriesLatest({ id: id, entityType: EntityType.DEVICE }, [attributeName])
      .pipe(
        op.first(),
        op.map((data: TimeseriesData) => {
          return data[attributeName][0].value as T;
        })
      );
  }

  protected doRpc<T>(
    id: string,
    method: string,
    params: object,
    timeout: number = 28e3 // milliseconds
  ): Observable<T> {
    const delay = 250; // milliseconds
    const start = new Date() as any as number;
    return this.deviceService
      .sendTwoWayRpcCommand(id, {
        method: method,
        params: params,
        timeout: timeout,
        persistent: true,
      })
      .pipe(
        op.first(),
        op.delay(delay),
        op.exhaustMap((response) =>
          this.deviceService.getPersistedRpc(response['rpcId']).pipe(
            op.first(),
            op.delayWhen((rpc: PersistentRpc) => interval(rpc.status === RpcStatus.SUCCESSFUL ? 0 : delay)),
            op.map((rpc: PersistentRpc) => {
              if (rpc.status !== RpcStatus.SUCCESSFUL) throw new Error('RPC result not yet ready'); // kicks in retry below
              return rpc.response as T; // passes through retry below
            }),
            op.retry({
              delay: () => {
                /* only retry when we haven't run out of time */
                const elapsed = (new Date() as any as number) - start;
                if (timeout - elapsed <= 0) throw new Error('RPC timed out'); // do not retry
                return of(null); // retry
              },
            })
          )
        )
      );
  }

  protected getConfigValueByRpc<T>(id: string, method: string, timeout: number = 5e3): Observable<T> {
    return this.doRpc<T>(id, method, {}, timeout);
  }

  protected setConfigValueByRpc(id: string, method: string, params: any): Observable<string> {
    return this.deviceService.sendTwoWayRpcCommand(id, { method, params }).pipe(
      op.first(),
      op.map((response: BasicRpcResponse) => {
        if (response.error) throw new Error(response.message);
        return response.message;
      })
    );
  }
}
