import { Injectable } from "@angular/core";
import {
  AlarmService,
  AttributeService,
  DeviceService,
  EntityRelationService,
  EntityService,
} from "@core/public-api";
import { EntityId } from "@shared/public-api";
import { Observable } from "rxjs";
import * as op from "rxjs/operators";
import { BasicGatewayService } from "../shared/basic-gateway-service";
import { EscalationConfig } from "./models/escalation.models";
import { SubEntity } from "./store/state";

const GET_ESCALATION_CONFIG_RPC = "get_escalation";
const SET_ESCALATION_CONFIG_RPC = "set_escalation";
const GET_OUTPUT_DEVICES = "get_output_devices";

export interface NamedEntityId extends EntityId {
  name: string;
}

interface NamedEntity {
  id: string;
  name: string;
}

interface OutputDevice {
  gateway: NamedEntity;
  device: NamedEntity;
}

@Injectable()
export class MessengerService extends BasicGatewayService {
  constructor(
    protected attributeService: AttributeService,
    protected entityService: EntityService,
    protected relationService: EntityRelationService,
    protected alarmService: AlarmService,
    protected deviceService: DeviceService
  ) {
    super(alarmService, attributeService, entityService, deviceService);
  }

  getEscalationConfig(messengerId: string): Observable<EscalationConfig> {
    return this.getConfigValueByRpc<EscalationConfig>(
      messengerId,
      GET_ESCALATION_CONFIG_RPC
    );
  }

  saveEscalationConfig(
    config: EscalationConfig,
    messengerId: string
  ): Observable<string> {
    return this.setConfigValueByRpc(
      messengerId,
      SET_ESCALATION_CONFIG_RPC,
      config
    );
  }

  getOutputGatewayDevices(messengerId: string): Observable<SubEntity[]> {
    return this.getConfigValueByRpc<OutputDevice[]>(
      messengerId,
      GET_OUTPUT_DEVICES
    ).pipe(
      op.map((namedEntities) => {
        return namedEntities.map((item) => ({
          parentId: item.gateway.id,
          id: item.device.id,
          name: item.device.name,
        }));
      })
    );
  }
}
