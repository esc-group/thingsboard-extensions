import { AlarmSeverity } from "@shared/public-api";

export interface QuantumConfig {
  ipAddress: string;
  username: string;
  password: string;
  useRoom: boolean;
}

export interface AlarmRule {
  alarmType: string;
  severity: AlarmSeverity;
  roomIds: number[];
  onEventCode: string;
  offEventCode: string;
}

export interface AlarmRuleConfig {
  matching: AlarmRule[];
  fallback: AlarmRule | null;
}

export interface QuantumRoom {
  id: number;
  name: string;
}
