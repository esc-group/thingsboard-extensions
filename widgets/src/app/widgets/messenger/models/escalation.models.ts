export interface EscalationLevel {
  name: string;
  timeout: number;
  acceptedTimeout: number; // zero for disabled
  next: string; // empty string for no next level
  devices?: string[];
  groups?: string[];
  alarms?: string[];
  dispatch: Record<string, string>;
  accept: Record<string, string>;
  cancel: Record<string, string>;
}

export interface EscalationGroup {
  name: string;
  devices: string[];
}

export interface EscalationConfig {
  levels: EscalationLevel[];
  groups: EscalationGroup[];
}
