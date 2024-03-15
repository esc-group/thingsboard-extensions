import { deepClone, guid as uuid1 } from '@core/public-api';
import { createReducer, on } from '@ngrx/store';
import * as EscalationActions from './actions';
import { Entity, initialState, State, UiEscalationGroup, UiEscalationLevel } from './state';

interface HasName {
  name: string;
}

const byNameField = (item1: HasName, item2: HasName): number => item1.name.localeCompare(item2.name);

export const escalationReducer = createReducer(
  initialState,
  on(EscalationActions.setLoading, (state) => ({
    ...state,
    isLoading: true,
    loadError: null,
  })),
  on(EscalationActions.setLoadSuccess, (state) => ({
    ...state,
    isLoading: false,
  })),
  on(EscalationActions.setLoadError, (state, { loadError }) => ({
    ...state,
    isLoading: false,
    loadError,
  })),

  on(EscalationActions.setSaving, (state) => ({
    ...state,
    isSaving: true,
    saveError: null,
  })),
  on(EscalationActions.setSaveSuccess, (state) => ({
    ...state,
    isSaving: false,
    saveError: null,
    pristineLevels: deepClone(state.levels),
    pristineGroups: deepClone(state.groups),
  })),
  on(EscalationActions.setSaveError, (state, { saveError }) => ({
    ...state,
    isSaving: false,
    saveError,
  })),

  on(EscalationActions.setMessengerId, (state, { messengerId }) => ({
    ...state,
    messengerId,
  })),

  on(EscalationActions.setEscalationConfig, (state, action) => {
    const levels: UiEscalationLevel[] = action.levels.map((level) => ({ id: uuid1(), ...level })).sort(byNameField);
    const groups: UiEscalationGroup[] = action.groups.map((group) => ({ id: uuid1(), ...group })).sort(byNameField);
    const selectedLevel: UiEscalationLevel = levels.length > 0 ? levels[0] : null;
    const selectedGroup: UiEscalationGroup = groups.length > 0 ? groups[0] : null;
    return {
      ...state,
      error: null,
      pristineLevels: deepClone(levels),
      pristineGroups: deepClone(groups),
      levels,
      groups,
      selectedLevel,
      selectedGroup,
    };
  }),
  on(EscalationActions.addLevel, (state, { level }) => ({
    ...state,
    levels: [...state.levels, level],
    selectedLevel: level,
  })),
  on(EscalationActions.addGroup, (state, { group }) => ({
    ...state,
    groups: [...state.groups, group],
    selectedGroup: group,
  })),
  on(EscalationActions.setSelectedLevel, (state, { level }) => ({
    ...state,
    selectedLevel: level,
  })),
  on(EscalationActions.setSelectedGroup, (state, { group }) => ({
    ...state,
    selectedGroup: group,
  })),
  on(EscalationActions.setInputGateways, (state, action) => {
    const inputGwMap: Record<string, Entity> = {};
    action.items.forEach((item) => {
      inputGwMap[item.id] = { id: item.id, name: item.name };
    });
    return { ...state, inputGwMap };
  }),
  on(EscalationActions.addGroupToLevel, (state, action) => {
    if (state.selectedLevel === null) {
      return state;
    }
    console.log('addGroupToLevel>', action.group);
    const newLevel = {
      ...state.selectedLevel,
      groups: [...state.selectedLevel.groups, action.group],
    };
    return {
      ...state,
      selectedLevel: newLevel,
      levels: state.levels.map((level) => (level.name === newLevel.name ? newLevel : level)),
    };
  }),
  on(EscalationActions.removeGroupFromLevel, (state, action) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const newLevel = {
      ...state.selectedLevel,
      groups: state.selectedLevel.groups.filter((group) => group !== action.group),
    };
    return {
      ...state,
      selectedLevel: newLevel,
      levels: state.levels.map((level) => (level.name === newLevel.name ? newLevel : level)),
    };
  }),
  on(EscalationActions.addDeviceToLevel, (state, action) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const newLevel = {
      ...state.selectedLevel,
      devices: [...state.selectedLevel.devices, action.device],
    };
    return {
      ...state,
      selectedLevel: newLevel,
      levels: state.levels.map((level) => (level.name === newLevel.name ? newLevel : level)),
    };
  }),
  on(EscalationActions.removeDeviceFromLevel, (state, action) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const newLevel = {
      ...state.selectedLevel,
      devices: state.selectedLevel.devices.filter((device) => device !== action.device),
    };
    return {
      ...state,
      selectedLevel: newLevel,
      levels: state.levels.map((level) => (level.name === newLevel.name ? newLevel : level)),
    };
  }),
  on(EscalationActions.addAlarmToLevel, (state, action) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const newLevel = {
      ...state.selectedLevel,
      alarms: [...state.selectedLevel.alarms, action.alarm],
    };
    return {
      ...state,
      selectedLevel: newLevel,
      levels: state.levels.map((level) => (level.name === newLevel.name ? newLevel : level)),
    };
  }),
  on(EscalationActions.removeAlarmFromLevel, (state, action) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const newLevel = {
      ...state.selectedLevel,
      alarms: state.selectedLevel.alarms.filter((alarm) => alarm !== action.alarm),
    };
    return {
      ...state,
      selectedLevel: newLevel,
      levels: state.levels.map((level) => (level.name === newLevel.name ? newLevel : level)),
    };
  }),
  on(EscalationActions.addDeviceToGroup, (state, action) => {
    if (state.selectedGroup === null) {
      return state;
    }
    const newGroup = {
      ...state.selectedGroup,
      devices: [...state.selectedGroup.devices, action.device.id],
    };
    return {
      ...state,
      selectedGroup: newGroup,
      groups: state.groups.map((group) => (group.id === newGroup.id ? newGroup : group)),
    };
  }),
  on(EscalationActions.removeDeviceFromGroup, (state, action) => {
    if (state.selectedGroup === null) {
      return state;
    }
    const newGroup = {
      ...state.selectedGroup,
      devices: state.selectedGroup.devices.filter((deviceId) => deviceId !== action.device.id),
    };
    return {
      ...state,
      selectedGroup: newGroup,
      groups: state.groups.map((group) => (group.id === newGroup.id ? newGroup : group)),
    };
  }),
  on(EscalationActions.deleteGroup, (state) => {
    const groups = state.groups.filter((group) => group.id !== state.selectedGroup.id);
    const selectedGroup = groups.length > 0 ? groups[0] : null;
    return { ...state, groups, selectedGroup };
  }),
  on(EscalationActions.reset, (state) => {
    const levels = deepClone(state.pristineLevels);
    const groups = deepClone(state.pristineGroups);
    return {
      ...state,
      levels,
      groups,
      selectedLevel: levels.length ? levels[0] : null,
      selectedGroup: groups.length ? groups[0] : null,
      additionalAlarmTypes: [],
    };
  }),

  on(EscalationActions.deleteLevel, (state) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const levels = state.levels.filter((level) => level.name !== state.selectedLevel.name);
    return {
      ...state,
      levels,
      selectedLevel: levels.length ? levels[0] : null,
    };
  }),
  on(EscalationActions.setLevelName, (state, { name }) => {
    if (state.selectedLevel === null) {
      return state;
    }
    const oldName = state.selectedLevel.name;
    const selectedLevel: UiEscalationLevel = {
      ...state.selectedLevel,
      name,
      next: state.selectedLevel.next === oldName ? name : state.selectedLevel.next,
    };
    const levels = state.levels.map((level) =>
      level === state.selectedLevel
        ? selectedLevel
        : {
            ...level,
            next: level.next === oldName ? name : level.next,
          }
    );
    return { ...state, levels, selectedLevel };
  }),
  on(EscalationActions.setGroupName, (state: State, { name }): State => {
    if (state.selectedGroup === null) {
      return state;
    }
    const oldName = state.selectedGroup.name;
    const selectedGroup: UiEscalationGroup = { ...state.selectedGroup, name };
    const groups = state.groups.map(
      (group: UiEscalationGroup): UiEscalationGroup => (group.id === state.selectedGroup.id ? selectedGroup : group)
    );
    const levels = state.levels.map(
      (level: UiEscalationLevel): UiEscalationLevel => ({
        ...level,
        groups: level.groups.map((group) => (group === oldName ? name : group)),
      })
    );
    const selectedLevel =
      state.selectedLevel === null ? null : levels.filter((level) => level.id === state.selectedLevel.id)[0];
    return { ...state, levels, groups, selectedGroup, selectedLevel };
  }),
  on(EscalationActions.patchLevel, (state, { patch }) => {
    if (Object.keys(patch).indexOf('name') !== -1) {
      throw new Error('Invalid Operation - Must use setLevelName action');
    }
    if (state.selectedLevel === null) {
      return state;
    }
    const selectedLevel: UiEscalationLevel = {
      ...state.selectedLevel,
      ...patch,
    };
    const levels = state.levels.map((level) => (level === state.selectedLevel ? selectedLevel : level));
    return { ...state, levels, selectedLevel };
  }),
  on(EscalationActions.setRecentAlarmTypes, (state, { alarmTypes }) => {
    return { ...state, recentAlarmTypes: alarmTypes };
  }),
  on(EscalationActions.setUserAlarmTypes, (state, { alarmTypes }) => {
    return { ...state, userAlarmTypes: alarmTypes };
  }),
  on(EscalationActions.setOutputDevices, (state, { devices }) => ({
    ...state,
    outputDevices: devices.sort(byNameField),
  })),
  on(EscalationActions.setDispatchTemplate, (state, { language, template }) => {
    let selectedLevel: UiEscalationLevel = { ...state.selectedLevel };
    selectedLevel.dispatch[language] = template;
    const levels = state.levels.map((level) => (level === state.selectedLevel ? selectedLevel : level));
    return { ...state, levels, selectedLevel };
  }),
  on(EscalationActions.setAcceptTemplate, (state, { language, template }) => {
    let selectedLevel: UiEscalationLevel = { ...state.selectedLevel };
    selectedLevel.accept[language] = template;
    const levels = state.levels.map((level) => (level === state.selectedLevel ? selectedLevel : level));
    return { ...state, levels, selectedLevel };
  }),
  on(EscalationActions.setCancelTemplate, (state, { language, template }) => {
    let selectedLevel: UiEscalationLevel = { ...state.selectedLevel };
    selectedLevel.cancel[language] = template;
    const levels = state.levels.map((level) => (level === state.selectedLevel ? selectedLevel : level));
    return { ...state, levels, selectedLevel };
  })
);
