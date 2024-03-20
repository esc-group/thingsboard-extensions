import { AlarmSeverity } from '@shared/models/alarm.models';

export interface BusinessRule {
  id: number;
  name: string;
}

export interface AlarmConfig {
  businessRuleId: number;
  alarmType: string;
  alarmSeverity: AlarmSeverity;
}

export interface RemoteServerConfig {
  url: string;
  username: string;
  password: string;
  verifySsl: boolean;
}

export interface LocalServerConfig {
  host: string;
  port: number;
}

export interface Person {
  deviceId: string;
  id: number;
  name: string;
}

export interface Tag {
  deviceId: string;
  id: number;
  primaryCode: number;
}

export interface Zone {
  deviceId: string;
  id: number;
  name: string;
}

export interface TagData {
  tagDeviceId: string;
  tagId: number;
  tagCode: number;

  personAssetId: string;
  personId: number;
  personName: string;

  zoneAssetId: string;
  zoneId: number;
  zoneName: string;
}
