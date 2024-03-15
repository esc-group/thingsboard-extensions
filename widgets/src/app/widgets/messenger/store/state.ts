import { EscalationGroup, EscalationLevel } from '../models/escalation.models';

export type EntityId = string;
export type SubEntityId = string;
export type Entity = { id: EntityId; name: string };
export type SubEntity = { parentId: EntityId; id: SubEntityId; name: string };

export interface UiEscalationLevel extends EscalationLevel {
  id: string;
}

export interface UiEscalationGroup extends EscalationGroup {
  id: string;
}

export interface UiEscalationConfig {
  levels: UiEscalationLevel[];
  groups: UiEscalationGroup[];
}

export interface State {
  isLoading: boolean;
  loadError?: string;

  isSaving: boolean;
  saveError?: string;

  pristineLevels: UiEscalationLevel[];
  pristineGroups: UiEscalationGroup[];

  levels: UiEscalationLevel[];
  groups: UiEscalationGroup[];

  selectedLevel?: UiEscalationLevel;
  selectedGroup?: UiEscalationGroup;

  recentAlarmTypes: string[];
  userAlarmTypes: string[];

  // this must be completely populated on startup
  outputDevices: SubEntity[];
  messengerId: string;
}

export const featureKey = 'escalation';

export const initialState: State = {
  isLoading: false,
  loadError: null,

  isSaving: false,
  saveError: null,

  pristineLevels: [],
  levels: [],
  pristineGroups: [],
  groups: [],

  selectedLevel: null,
  selectedGroup: null,

  recentAlarmTypes: [],
  userAlarmTypes: [],

  outputDevices: [],

  messengerId: '',
};
