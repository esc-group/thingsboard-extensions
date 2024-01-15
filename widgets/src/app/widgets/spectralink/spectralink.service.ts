import { Injectable } from "@angular/core";
import {
  AlarmService,
  AttributeService,
  DeviceService,
  EntityService,
} from "@core/public-api";
import { Observable } from "rxjs";
import { BasicGatewayService } from "../shared/basic-gateway-service";
import { HandsetConfig, ServerConfig } from "./models";

const GET_SERVER_CONFIG_RPC = "get_handset_server";
const SET_SERVER_CONFIG_RPC = "set_handset_server";

const GET_CLIENT_CONFIG_RPC = "get_handset_login";
const SET_CLIENT_CONFIG_RPC = "set_handset_login";

@Injectable()
export class SpectralinkService extends BasicGatewayService {
  constructor(
    protected entityService: EntityService,
    protected alarmService: AlarmService,
    protected attributeService: AttributeService,
    protected deviceService: DeviceService
  ) {
    super(alarmService, attributeService, entityService, deviceService);
  }

  getServerConfig(gatewayId: string): Observable<ServerConfig> {
    return this.getConfigValueByRpc<ServerConfig>(
      gatewayId,
      GET_SERVER_CONFIG_RPC
    );
  }

  setServerConfig(gatewayId: string, config: ServerConfig): Observable<any> {
    return this.setConfigValueByRpc(gatewayId, SET_SERVER_CONFIG_RPC, config);
  }

  getHandsetConfig(gatewayId: string): Observable<HandsetConfig> {
    return this.getConfigValueByRpc<HandsetConfig>(
      gatewayId,
      GET_CLIENT_CONFIG_RPC
    );
  }

  setHandsetConfig(gatewayId: string, config: HandsetConfig): Observable<any> {
    return this.setConfigValueByRpc(gatewayId, SET_CLIENT_CONFIG_RPC, config);
  }
}
