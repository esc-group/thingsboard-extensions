import { Injectable } from '@angular/core';
import { AlarmService, AttributeService, DeviceService, EntityService } from '@core/public-api';
import { Observable, of } from 'rxjs';

import { BasicGatewayService } from '../shared/basic-gateway-service';
import { AlarmRuleConfig, QuantumConfig, QuantumRoom } from './models';

const ALARM_RULES_CONFIG = 'alarmRules';
const QUANTUM_CONFIG = 'settings';

@Injectable()
export class JnlService extends BasicGatewayService {
  constructor(
    protected entityService: EntityService,
    protected alarmService: AlarmService,
    protected attributeService: AttributeService,
    protected deviceService: DeviceService
  ) {
    super(alarmService, attributeService, entityService, deviceService);
  }

  getAlarmRuleConfig(gatewayId: string): Observable<AlarmRuleConfig> {
    return this.getSingleAttribute<AlarmRuleConfig>(gatewayId, ALARM_RULES_CONFIG);
  }

  getQuantumConfig(gatewayId: string): Observable<QuantumConfig> {
    return this.getSingleAttribute<QuantumConfig>(gatewayId, QUANTUM_CONFIG);
  }

  setAlarmRuleConfig(gatewayId: string, config: AlarmRuleConfig): Observable<any> {
    return this.setSingleAttribute(gatewayId, ALARM_RULES_CONFIG, config);
  }

  setQuantumConfig(gatewayId: string, config: QuantumConfig): Observable<any> {
    return this.setSingleAttribute(gatewayId, QUANTUM_CONFIG, config);
  }

  getQuantumRooms(_gatewayId: string): Observable<QuantumRoom[]> {
    return of([
      { id: 101, name: 'Room 101' },
      { id: 102, name: 'Room 102' },
      { id: 103, name: 'Room 103' },
      { id: 201, name: 'Room 201' },
      { id: 202, name: 'Room 202' },
    ]);
  }
}
