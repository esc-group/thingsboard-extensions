import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  AlarmService,
  AttributeService,
  DeviceService,
  EntityRelationService,
  EntityService,
} from "@core/public-api";
import {
  AliasFilterType,
  AttributeScope,
  BooleanOperation,
  Device,
  EntityKeyType,
  EntityKeyValueType,
  EntitySearchDirection,
  EntityType,
  FilterPredicateType,
  RelationTypeGroup,
  StringOperation,
} from "@shared/public-api";
import { forkJoin, Observable, of } from "rxjs";
import * as op from "rxjs/operators";
import { BasicGatewayService } from "../shared/basic-gateway-service";
import {
  CREATED_RELATION_TYPE,
  MESSENGER_RELATION_TYPE,
} from "../shared/constants";
import {
  IS_TAP_GATEWAY_ATTRIBUTE_NAME,
  IS_TAP_PAGER_ATTRIBUTE_NAME,
  SERVER_CONFIG_ATTRIBUTE_NAME,
  TAP_NUMBER_ATTRIBUTE_NAME,
  TAP_PAGER_DEVICE_TYPE,
} from "./constants";
import { TapGateway, TapPager, TapServerConfig } from "./models";

@Injectable()
export class TapService extends BasicGatewayService {
  constructor(
    protected http: HttpClient,
    protected entityService: EntityService,
    protected alarmService: AlarmService,
    protected attributeService: AttributeService,
    protected deviceService: DeviceService,
    protected entityRelationService: EntityRelationService
  ) {
    super(alarmService, attributeService, entityService, deviceService);
  }

  getTapGateway(gatewayName: string): Observable<TapGateway> {
    return this.entityService
      .findEntityDataByQuery({
        pageLink: { page: 0, pageSize: 1 },
        entityFilter: {
          type: AliasFilterType.entityType,
          entityType: EntityType.DEVICE,
        },
        entityFields: [{ type: EntityKeyType.ENTITY_FIELD, key: "name" }],
        latestValues: [
          { type: EntityKeyType.ATTRIBUTE, key: SERVER_CONFIG_ATTRIBUTE_NAME },
        ],
        keyFilters: [
          {
            key: { type: EntityKeyType.ENTITY_FIELD, key: "name" },
            valueType: EntityKeyValueType.STRING,
            predicate: {
              type: FilterPredicateType.STRING,
              operation: StringOperation.EQUAL,
              value: { defaultValue: gatewayName },
              ignoreCase: false,
            },
          },
          {
            key: {
              type: EntityKeyType.ATTRIBUTE,
              key: IS_TAP_GATEWAY_ATTRIBUTE_NAME,
            },
            valueType: EntityKeyValueType.BOOLEAN,
            predicate: {
              type: FilterPredicateType.BOOLEAN,
              operation: BooleanOperation.EQUAL,
              value: { defaultValue: true },
            },
          },
        ],
      })
      .pipe(
        op.map((pageData) => {
          const entityData = pageData.data[0];
          const config = JSON.parse(
            entityData.latest["ATTRIBUTE"][SERVER_CONFIG_ATTRIBUTE_NAME][
              "value"
            ]
          );
          const tapGateway: TapGateway = {
            deviceId: entityData.entityId.id,
            deviceName: gatewayName,
            host: config.host,
            port: config.port,
            heartbeatSeconds: config.heartbeatSeconds ?? 60,
            heartbeatNumber: config.heartbeatNumber ?? "0",
            heartbeatMessage: config.heartbeatMessage ?? "HEARTBEAT",
          };
          return tapGateway;
        })
      );
  }

  saveTapGateway(gateway: TapGateway): Observable<any> {
    const config: TapServerConfig = {
      host: gateway.host,
      port: gateway.port,
      heartbeatSeconds: gateway.heartbeatSeconds,
      heartbeatMessage: gateway.heartbeatMessage,
      heartbeatNumber: gateway.heartbeatNumber,
    };
    return this.attributeService.saveEntityAttributes(
      { id: gateway.deviceId, entityType: EntityType.DEVICE },
      AttributeScope.SHARED_SCOPE,
      [{ key: SERVER_CONFIG_ATTRIBUTE_NAME, value: config }]
    );
  }

  getTapPagers(gatewayId: string): Observable<TapPager[]> {
    return this.entityRelationService
      .findByQuery({
        parameters: {
          rootId: gatewayId,
          rootType: EntityType.DEVICE,
          direction: EntitySearchDirection.FROM,
          maxLevel: 1,
        },
        filters: [
          {
            relationType: CREATED_RELATION_TYPE,
            entityTypes: [EntityType.DEVICE],
          },
        ],
      })
      .pipe(
        op.tap((relations) => {
          console.log("pager relations", relations);
        }),
        op.map((relations) =>
          forkJoin(
            relations.map((relation) =>
              this.entityService
                .findEntityDataByQuery({
                  entityFilter: {
                    type: AliasFilterType.entityType,
                    entityType: EntityType.DEVICE,
                  },
                  entityFields: [
                    { type: EntityKeyType.ENTITY_FIELD, key: "name" },
                  ],
                  latestValues: [
                    {
                      type: EntityKeyType.ATTRIBUTE,
                      key: TAP_NUMBER_ATTRIBUTE_NAME,
                    },
                  ],
                  keyFilters: [
                    {
                      key: { type: EntityKeyType.ENTITY_FIELD, key: "id" },
                      valueType: EntityKeyValueType.STRING,
                      predicate: {
                        type: FilterPredicateType.STRING,
                        operation: StringOperation.EQUAL,
                        value: { defaultValue: relation.from.id },
                        ignoreCase: true,
                      },
                    },
                    {
                      key: {
                        type: EntityKeyType.ATTRIBUTE,
                        key: IS_TAP_PAGER_ATTRIBUTE_NAME,
                      },
                      valueType: EntityKeyValueType.BOOLEAN,
                      predicate: {
                        type: FilterPredicateType.BOOLEAN,
                        operation: BooleanOperation.EQUAL,
                        value: { defaultValue: true },
                      },
                    },
                  ],
                  pageLink: { page: 0, pageSize: 128 },
                })
                .pipe(
                  op.tap((pageData) => {
                    console.log("pager pageData", pageData);
                  }),
                  op.filter((pageData) => pageData.data.length === 1),
                  op.map((pageData) => {
                    const entityData = pageData.data[0];
                    const pager: TapPager = {
                      deviceId: relation.to.id,
                      deviceName:
                        entityData.latest["ENTITY_FIELD"]["name"]["value"],
                      pagerNumber:
                        entityData.latest["ATTRIBUTE"][
                          TAP_NUMBER_ATTRIBUTE_NAME
                        ]["value"],
                      gatewayId: gatewayId,
                    };
                    return pager;
                  })
                )
            )
          )
        ),
        op.concatAll()
      );
  }

  addPager(
    gatewayId: string,
    pagerName: string,
    pagerNumber: string
  ): Observable<Device> {
    return this.deviceService
      .saveDevice({ name: pagerName, type: TAP_PAGER_DEVICE_TYPE, label: "" })
      .pipe(
        op.switchMap((pager: Device) =>
          forkJoin([
            of(pager), // we use this value as final result
            this.attributeService.saveEntityAttributes(
              pager.id,
              AttributeScope.SERVER_SCOPE,
              [
                { key: TAP_NUMBER_ATTRIBUTE_NAME, value: pagerNumber },
                { key: IS_TAP_PAGER_ATTRIBUTE_NAME, value: true },
              ]
            ),
            this.entityRelationService.saveRelation({
              from: { id: gatewayId, entityType: EntityType.DEVICE },
              to: pager.id,
              type: MESSENGER_RELATION_TYPE,
              typeGroup: RelationTypeGroup.COMMON,
            }),
          ])
        ),
        op.map(([device]) => device)
      );
  }

  deletePager(pagerDeviceId: string): Observable<any> {
    return this.deviceService.deleteDevice(pagerDeviceId);
  }
}
