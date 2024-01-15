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
  BooleanOperation,
  EntityData,
  EntityDataQuery,
  EntityKeyType,
  EntityKeyValueType,
  EntityRelation,
  EntitySearchDirection,
  EntityType,
  FilterPredicateType,
  NumericOperation,
  PageData,
  StringOperation,
} from "@shared/public-api";
import { firstValueFrom, forkJoin, from, Observable, of } from "rxjs";
import * as op from "rxjs/operators";
import { BasicGatewayService } from "../shared/basic-gateway-service";
import {
  BusinessRule,
  BusinessRuleMap,
  GatewayConfig,
  LitumConfig,
  Person,
  Tag,
  TagData,
  Zone,
} from "./models";

const GET_GATEWAY_CONFIG_RPC = "get_web_config";
const SET_GATEWAY_CONFIG_RPC = "set_web_config";

const GET_LITUM_CONFIG_RPC = "get_login_config";
const SET_LITUM_CONFIG_RPC = "set_login_config";

const GET_ALARM_CONFIG_RPC = "get_alarm_config";
const SET_ALARM_CONFIG_RPC = "set_alarm_config";

const GET_BUSINESS_RULES_RPC = "get_business_rules";

const IS_TAG = "isTag";
const IS_ZONE = "isZone";
const IS_PERSON = "isHuman";
const PERSON_ID = "litumEntityId";
const TAG_ID = "litumTagId";
const ZONE_ID = "litumZoneId";
const PERSON_NAME = "litumEntityName";
const PRIMARY_CODE = "litumPrimaryCode";
const ZONE_NAME = "litumZoneName";
const OWNER_RELATION = "Owner";
const POSITION_RELATION = "Position";

@Injectable()
export class LitumService extends BasicGatewayService {
  constructor(
    protected entityService: EntityService,
    protected alarmService: AlarmService,
    protected attributeService: AttributeService,
    protected deviceService: DeviceService,
    protected relationService: EntityRelationService
  ) {
    super(alarmService, attributeService, entityService, deviceService);
  }

  getLitumConfig(gatewayId: string): Observable<LitumConfig> {
    return this.getConfigValueByRpc<LitumConfig>(
      gatewayId,
      GET_LITUM_CONFIG_RPC
    );
  }

  getGatewayConfig(gatewayId: string): Observable<GatewayConfig> {
    return this.getConfigValueByRpc<GatewayConfig>(
      gatewayId,
      GET_GATEWAY_CONFIG_RPC
    );
  }

  getBusinessRuleMap(gatewayId: string): Observable<BusinessRuleMap> {
    return this.getConfigValueByRpc<BusinessRuleMap>(
      gatewayId,
      GET_ALARM_CONFIG_RPC
    );
  }

  setBusinessRuleMap(
    gatewayId: string,
    businessRuleMap: BusinessRuleMap
  ): Observable<string> {
    return this.setConfigValueByRpc(
      gatewayId,
      SET_ALARM_CONFIG_RPC,
      businessRuleMap
    );
  }

  setLitumConfig(gatewayId: string, litumConfig: LitumConfig): Observable<any> {
    return this.setConfigValueByRpc(
      gatewayId,
      SET_LITUM_CONFIG_RPC,
      litumConfig
    );
  }

  setGatewayConfig(
    gatewayId: string,
    gatewayConfig: GatewayConfig
  ): Observable<any> {
    return this.setConfigValueByRpc(
      gatewayId,
      SET_GATEWAY_CONFIG_RPC,
      gatewayConfig
    );
  }

  getBusinessRules(gatewayId: string): Observable<BusinessRule[]> {
    return this.deviceService
      .sendTwoWayRpcCommand(gatewayId, {
        method: GET_BUSINESS_RULES_RPC,
        params: {},
      })
      .pipe(
        op.map((rpcResponse) => {
          if (rpcResponse.error.length > 0) throw new Error(rpcResponse.error);
          return rpcResponse.rules;
        })
      );
    // if (gatewayId.length === 0) throw new Error("litum id is invalid / not set")
    // // return this.deviceService.sendTwoWayRpcCommand(gatewayId, { method: "getBusinessRules" }).pipe(op.map((x) => []))
    // return of([
    //   { id: 12, name: "1A Staff Duress" },
    //   { id: 13, name: "1B Staff Duress" },
    //   { id: 14, name: "1C Staff Duress" },
    // ])
  }

  getPersons(page = 0, pageSize = 100): Observable<PageData<Person>> {
    const query: EntityDataQuery = {
      // @ts-ignore
      entityFilter: {
        type: AliasFilterType.entityType,
        entityType: EntityType.ASSET,
        // resolveMultiple: true,
      },
      entityFields: [{ type: EntityKeyType.ENTITY_FIELD, key: "name" }],
      latestValues: [
        { type: EntityKeyType.ATTRIBUTE, key: PERSON_ID },
        { type: EntityKeyType.ATTRIBUTE, key: PERSON_NAME },
      ],
      keyFilters: [
        {
          key: { key: PERSON_ID, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.NUMERIC,
          predicate: {
            type: FilterPredicateType.NUMERIC,
            operation: NumericOperation.GREATER,
            value: { defaultValue: 0 },
          },
        },
        {
          key: { key: PERSON_NAME, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.STRING,
          predicate: {
            type: FilterPredicateType.STRING,
            operation: StringOperation.NOT_EQUAL,
            value: { defaultValue: "" },
            ignoreCase: false,
          },
        },
        {
          key: { key: IS_PERSON, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.BOOLEAN,
          predicate: {
            type: FilterPredicateType.BOOLEAN,
            operation: BooleanOperation.EQUAL,
            value: { defaultValue: true },
          },
        },
      ],
      pageLink: { page, pageSize },
    };
    return this.entityService.findEntityDataByQuery(query).pipe(
      op.map((pageData: PageData<EntityData>) => {
        return {
          ...pageData,
          data: pageData.data.map((item: EntityData) => ({
            deviceId: item.entityId.id,
            id: parseInt(item.latest["ATTRIBUTE"][PERSON_ID]["value"]),
            name: item.latest["ATTRIBUTE"][PERSON_NAME]["value"],
          })),
        };
      })
    );
  }

  getTags(page = 0, pageSize = 100): Observable<PageData<Tag>> {
    const query: EntityDataQuery = {
      // @ts-ignore
      entityFilter: {
        type: AliasFilterType.entityType,
        entityType: EntityType.DEVICE,
        // resolveMultiple: true,
      },
      entityFields: [{ type: EntityKeyType.ENTITY_FIELD, key: "name" }],
      latestValues: [
        { type: EntityKeyType.ATTRIBUTE, key: TAG_ID },
        { type: EntityKeyType.ATTRIBUTE, key: PRIMARY_CODE },
      ],
      keyFilters: [
        {
          key: { key: TAG_ID, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.NUMERIC,
          predicate: {
            type: FilterPredicateType.NUMERIC,
            operation: NumericOperation.GREATER_OR_EQUAL,
            value: { defaultValue: 0, dynamicValue: null },
          },
        },
        {
          key: { key: IS_TAG, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.BOOLEAN,
          predicate: {
            type: FilterPredicateType.BOOLEAN,
            operation: BooleanOperation.EQUAL,
            value: { defaultValue: true, dynamicValue: null },
          },
        },
      ],
      pageLink: { page, pageSize },
    };
    return this.entityService.findEntityDataByQuery(query).pipe(
      op.map((pageData: PageData<EntityData>) => {
        return {
          ...pageData,
          data: pageData.data.map((item: EntityData) => ({
            deviceId: item.entityId.id,
            id: parseInt(item.latest["ATTRIBUTE"][TAG_ID]["value"]),
            primaryCode: parseInt(
              item.latest["ATTRIBUTE"][PRIMARY_CODE]["value"]
            ),
          })),
        };
      })
    );
  }

  getZones(page = 0, pageSize = 100): Observable<PageData<Zone>> {
    const query: EntityDataQuery = {
      // @ts-ignore
      entityFilter: {
        type: AliasFilterType.entityType,
        entityType: EntityType.ASSET,
        // resolveMultiple: true,
      },
      entityFields: [{ type: EntityKeyType.ENTITY_FIELD, key: "name" }],
      latestValues: [
        { type: EntityKeyType.ATTRIBUTE, key: ZONE_ID },
        { type: EntityKeyType.ATTRIBUTE, key: ZONE_NAME },
      ],
      keyFilters: [
        {
          key: { key: ZONE_ID, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.NUMERIC,
          predicate: {
            type: FilterPredicateType.NUMERIC,
            operation: NumericOperation.GREATER_OR_EQUAL,
            value: { defaultValue: 0, dynamicValue: null },
          },
        },
        {
          key: { key: IS_ZONE, type: EntityKeyType.ATTRIBUTE },
          valueType: EntityKeyValueType.BOOLEAN,
          predicate: {
            type: FilterPredicateType.BOOLEAN,
            operation: BooleanOperation.EQUAL,
            value: { defaultValue: true, dynamicValue: null },
          },
        },
      ],
      pageLink: { page, pageSize },
    };
    return this.entityService.findEntityDataByQuery(query).pipe(
      op.map((pageData: PageData<EntityData>) => {
        return {
          ...pageData,
          data: pageData.data.map((item: EntityData) => ({
            deviceId: item.entityId.id,
            id: parseInt(item.latest["ATTRIBUTE"][ZONE_ID]["value"]),
            name: item.latest["ATTRIBUTE"][ZONE_NAME]["value"],
          })),
        };
      })
    );
  }

  async getAllPersons(): Promise<Map<string, Person>> {
    const personMap = new Map<string, Person>();
    let currentPage = 0;
    while (true) {
      const pageData = await firstValueFrom(
        this.getPersons(currentPage).pipe(
          op.tap((pageData) => {
            pageData.data.forEach((person) => {
              personMap.set(person.deviceId, person);
            });
            currentPage += 1;
          })
        )
      );
      if (!pageData.hasNext) break;
    }
    return personMap;
  }

  async getAllZones(): Promise<Map<string, Zone>> {
    const zoneMap = new Map<string, Zone>();
    let currentPage = 0;
    while (true) {
      const pageData = await firstValueFrom(
        this.getZones(currentPage).pipe(
          op.tap((pageData) => {
            pageData.data.forEach((zone) => {
              zoneMap.set(zone.deviceId, zone);
            });
            currentPage += 1;
          })
        )
      );
      if (!pageData.hasNext) break;
    }
    return zoneMap;
  }

  async getAllTags(): Promise<Map<string, Tag>> {
    let currentPage = 0;
    const tagMap = new Map<string, Tag>();
    while (true) {
      const pageData = await firstValueFrom(
        this.getTags(currentPage).pipe(
          op.tap((pageData) => {
            pageData.data.forEach((tag) => {
              tagMap.set(tag.deviceId, tag);
            });
            currentPage += 1;
          })
        )
      );
      if (!pageData.hasNext) break;
    }
    return tagMap;
  }

  getTagData(): Observable<TagData> {
    let personMap: Map<string, Person>;
    let tagMap: Map<string, Tag>;
    let zoneMap: Map<string, Zone>;
    return forkJoin([
      from(this.getAllPersons()),
      from(this.getAllTags()),
      from(this.getAllZones()),
    ]).pipe(
      op.tap(([people, tags, zones]) => {
        console.log(
          `getTagData() got ${people.size} people, ${tags.size} tags and ${zones.size} zones`
        );
        personMap = people;
        tagMap = tags;
        zoneMap = zones;
      }),
      op.switchMap(() => {
        return of(...tagMap.values()).pipe(
          op.mergeMap(
            (tag) =>
              this.relationService.findByQuery({
                parameters: {
                  rootId: tag.deviceId,
                  rootType: EntityType.DEVICE,
                  direction: EntitySearchDirection.TO,
                  maxLevel: 1,
                },
                filters: [
                  {
                    relationType: OWNER_RELATION,
                    entityTypes: [EntityType.ASSET],
                  },
                  {
                    relationType: POSITION_RELATION,
                    entityTypes: [EntityType.ASSET],
                  },
                ],
              }),
            5
          )
        );
      }),
      op.filter((tagRelations: EntityRelation[]) => tagRelations.length == 2),
      op.map((tagRelations: EntityRelation[]): TagData => {
        let personAssetId = "";
        let personId = 0;
        let personName = "[Unknown]";
        let zoneAssetId = "";
        let zoneId = 0;
        let zoneName = "[Unknown]";
        tagRelations.forEach((relation: EntityRelation) => {
          if (relation.type == OWNER_RELATION) {
            const person = personMap.get(relation.from.id);
            console.log("getTagData() person is", person);
            personAssetId = person.deviceId;
            personId = person.id;
            personName = person.name;
          } else if (relation.type == POSITION_RELATION) {
            const zone = zoneMap.get(relation.from.id);
            console.log("getTagData() zone is", zone);
            zoneAssetId = zone.deviceId;
            zoneId = zone.id;
            zoneName = zone.name;
          } else {
            console.warn("Unexpected relation type " + relation.type);
          }
        });
        const tag =
          tagRelations.length > 0
            ? tagMap.get(tagRelations[0].to.id)
            : undefined;
        // if (tag == undefined) console.warn("tag not found", tagRelations)
        console.log("getTagData() tag is", tag);
        return {
          tagDeviceId: tag?.deviceId,
          tagId: tag?.id,
          tagCode: tag?.primaryCode,
          personAssetId,
          personId,
          personName,
          zoneAssetId,
          zoneId,
          zoneName,
        } as TagData;
      })
    );
  }
}
