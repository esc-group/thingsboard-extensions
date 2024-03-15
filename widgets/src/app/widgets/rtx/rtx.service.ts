import { Injectable } from '@angular/core';
import { AlarmService, AttributeService, DeviceService, EntityService } from '@core/public-api';
import { Observable } from 'rxjs';
import { BasicGatewayService } from '../shared/basic-gateway-service';
import { RtxConfig } from './models';

const GET_RTX_CONFIG = 'get_rtx_config';
const SET_RTX_CONFIG = 'set_rtx_config';

@Injectable()
export class RtxService extends BasicGatewayService {
  constructor(
    protected entityService: EntityService,
    protected alarmService: AlarmService,
    protected attributeService: AttributeService,
    protected deviceService: DeviceService
  ) {
    super(alarmService, attributeService, entityService, deviceService);
  }

  getRtxConfig(gatewayId: string): Observable<RtxConfig> {
    return this.getConfigValueByRpc(gatewayId, GET_RTX_CONFIG, 5e3);
  }

  setRtxConfig(gatewayId: string, config: RtxConfig): Observable<any> {
    return this.setConfigValueByRpc(gatewayId, SET_RTX_CONFIG, config);
  }
}
