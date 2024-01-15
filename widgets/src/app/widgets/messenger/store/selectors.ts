/* eslint-disable @typescript-eslint/no-shadow */

import { createSelector } from "@ngrx/store";
import {
  EscalationConfig,
  EscalationGroup,
  EscalationLevel,
} from "../models/escalation.models";
import {
  featureKey,
  State,
  UiEscalationGroup,
  UiEscalationLevel,
} from "./state";
import { SaveData } from "./types";

export const omit = (obj: any, omitKey: string) =>
  Object.keys(obj).reduce((result, key) => {
    if (key !== omitKey) {
      result[key] = obj[key];
    }
    return result;
  }, {});

const featureState = (state: any) => state[featureKey] as State;

export const isLoading = createSelector(
  featureState,
  (state) => state.isLoading
);
export const loadError = createSelector(
  featureState,
  (state) => state.loadError
);
export const isSaving = createSelector(featureState, (state) => state.isSaving);
export const saveError = createSelector(
  featureState,
  (state) => state.saveError
);

export const messengerId = createSelector(
  featureState,
  (state) => state.messengerId
);
export const saveData = createSelector(
  featureState,
  (state) =>
    ({
      config: {
        levels: state.levels.map(
          (level) => omit(level, "id") as EscalationLevel
        ),
        groups: state.groups.map(
          (group) => omit(group, "id") as EscalationGroup
        ),
      } as EscalationConfig,
      messengerId: state.messengerId,
    } as SaveData)
);
export const levels = createSelector(
  featureState,
  (state) => state.levels as UiEscalationLevel[]
);
export const groups = createSelector(
  featureState,
  (state) => state.groups as UiEscalationGroup[]
);
export const combinedAlarmTypes = createSelector(featureState, (state) => {
  const configuredAlarmTypes = state.levels.reduce(
    (alarmTypes: string[], level: UiEscalationLevel) => {
      return [...alarmTypes, ...level.alarms];
    },
    [] as string[]
  );
  const combinedAlarmTypes = new Set([
    ...configuredAlarmTypes,
    ...state.userAlarmTypes,
    ...state.recentAlarmTypes,
  ]);
  return Array.from(combinedAlarmTypes).sort();
});
export const groupNames = createSelector(groups, (groups) =>
  groups.map((group) => group.name)
);

export const selectedLevel = createSelector(
  featureState,
  (state) => state.selectedLevel
);
export const selectedGroup = createSelector(
  featureState,
  (state) => state.selectedGroup
);
export const outputDeviceList = createSelector(
  featureState,
  (state) => state.outputDevices
);

export const selectedLevelUsedByLevels = createSelector(
  levels,
  selectedLevel,
  (levels, selectedLevel) =>
    selectedLevel === null
      ? []
      : levels.filter(
          (level) =>
            level !== selectedLevel && level.next === selectedLevel.name
        )
);
export const selectedGroupUsedByLevels = createSelector(
  levels,
  selectedGroup,
  (levels, selectedGroup) =>
    selectedGroup === null
      ? []
      : levels.filter(
          (level) => level.groups.indexOf(selectedGroup.name) !== -1
        )
);

export const selectedLevelIsSafeToRemove = createSelector(
  selectedLevelUsedByLevels,
  selectedLevel,
  (levels, selectedLevel) => {
    return selectedLevel === null
      ? false
      : levels.length > 0 || selectedLevel
      ? selectedLevel.alarms.length > 0
      : false;
  }
);

export const levelNames = createSelector(levels, (levels) =>
  levels.map((level) => level.name)
);
