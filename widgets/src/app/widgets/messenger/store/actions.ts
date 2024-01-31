import { createAction, props } from "@ngrx/store";
import { EscalationConfig } from "../models/escalation.models";
import { SubEntity, UiEscalationGroup, UiEscalationLevel } from "./state";
import { NamedEntityId } from "../messenger.service";

export const setLoading = createAction("[Escalation] Loading started");
export const setLoadSuccess = createAction("[Escalation] Loading completed");
export const getEscalationConfig = createAction("[Escalation] Get Config");
export const setLoadError = createAction(
  "[Escalation] setLoadingError",
  props<{ loadError: string }>()
);
export const setEscalationConfig = createAction(
  "[Escalation] setEscalationConfig",
  props<EscalationConfig>()
);
export const getEscalationConfigSuccess = createAction(
  "[Escalation] Get Config Success",
  props<EscalationConfig>()
);
export const getEscalationConfigFailure = createAction(
  "[Escalation] Get Config Failure",
  props<{ error: string }>()
);
export const addLevel = createAction(
  "[Escalation] Add Level",
  props<{ level: UiEscalationLevel }>()
);
export const addGroup = createAction(
  "[Escalation] Add Group",
  props<{ group: UiEscalationGroup }>()
);
export const deleteLevel = createAction("[Escalation] Delete Level");
export const deleteGroup = createAction("[Escalation] Delete Group");
export const addDeviceToLevel = createAction(
  "[Escalation] Add Device to Level",
  props<{ device: string }>()
);
export const removeDeviceFromLevel = createAction(
  "[Escalation] Remove Device from Level",
  props<{ device: string }>()
);
export const addGroupToLevel = createAction(
  "[Escalation] Add Group to Level",
  props<{ group: string }>()
);
export const removeGroupFromLevel = createAction(
  "[Escalation] Remove Group from Level",
  props<{ group: string }>()
);
export const addAlarmToLevel = createAction(
  "[Escalation] Add alarm to level",
  props<{ alarm: string }>()
);
export const removeAlarmFromLevel = createAction(
  "[Escalation] Remove alarm from level",
  props<{ alarm: string }>()
);
export const addDeviceToGroup = createAction(
  "[Escalation] Add Device to Group",
  props<{ device: SubEntity }>()
);
export const removeDeviceFromGroup = createAction(
  "[Escalation] Remove Device from Group",
  props<{ device: SubEntity }>()
);
export const setSelectedLevel = createAction(
  "[Escalation] Set Selected Level",
  props<{ level?: UiEscalationLevel }>()
);
export const setSelectedGroup = createAction(
  "[Escalation] Set Selected Group",
  props<{ group?: UiEscalationGroup }>()
);
export const setInputGateways = createAction(
  "[Escalation] Set Input Gateways",
  props<{ items: NamedEntityId[] }>()
);
export const setOutputGateways = createAction(
  "[Escalation] Set Output Gateways",
  props<{ gateways: NamedEntityId[] }>()
);

export const setOutputDevices = createAction(
  "[Escalation] Set Output Devices",
  props<{ devices: SubEntity[] }>()
);
export const reset = createAction("[Escalation] Reset");
export const setSaving = createAction("[Escalation] setSaving");
export const setSaveError = createAction(
  "[Escalation] setSaveError",
  props<{ saveError: string }>()
);
export const setSaveSuccess = createAction("[Escalation] setSaveSuccess");
export const patchLevel = createAction(
  "[Escalation] patch level",
  props<{ patch: Partial<UiEscalationLevel> }>()
);
export const setLevelName = createAction(
  "[Escalation] set level name",
  props<{ name: string }>()
);
export const setGroupName = createAction(
  "[Escalation] set group name",
  props<{ name: string }>()
);
export const setRecentAlarmTypes = createAction(
  "[Escalation] setRecentAlarmTypes",
  props<{ alarmTypes: string[] }>()
);
export const setUserAlarmTypes = createAction(
  "[Escalation] setUserAlarmTypes",
  props<{ alarmTypes: string[] }>()
);
export const setMessengerId = createAction(
  "[Escalation] set messengerId",
  props<{ messengerId: string }>()
);

export const setDispatchTemplate = createAction(
  "[Escalation] set dispatchTemplate",
  props<{ language: string; template: string }>()
);
export const setAcceptTemplate = createAction(
  "[Escalation] set acceptTemplate",
  props<{ language: string; template: string }>()
);
export const setCancelTemplate = createAction(
  "[Escalation] set cancelTemplate",
  props<{ language: string; template: string }>()
);
