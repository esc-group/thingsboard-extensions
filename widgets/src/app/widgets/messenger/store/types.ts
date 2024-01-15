import { EscalationConfig } from "../models/escalation.models";

export interface SaveData {
  config: EscalationConfig;
  messengerId: string;
}
