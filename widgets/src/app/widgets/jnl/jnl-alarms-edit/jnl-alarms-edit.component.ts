import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { AlarmSeverity } from '@shared/public-api';
import { AlarmRule, AlarmRuleConfig, QuantumRoom } from '../models';
import { EventCodes } from './event-codes';

interface UiAlarmRule {
  alarmType: string;
  alarmSeverity: AlarmSeverity;
  rooms: QuantumRoom[];
  onEventCode: string;
  offEventCode: string;
}

interface UiAlarmRuleConfig {
  matching: UiAlarmRule[];
  fallback: UiAlarmRule | null;
}

const getRoomName = (roomId: number, rooms: QuantumRoom[]): string => {
  const room = rooms.find((item) => item.id === roomId);
  return room ? room.name : `? Room ${roomId} ?`;
};

const getUiAlarmRule = (alarmRule: AlarmRule, rooms: QuantumRoom[]): UiAlarmRule =>
  alarmRule
    ? {
        alarmType: alarmRule.alarmType,
        alarmSeverity: alarmRule.severity,
        rooms: alarmRule.roomIds.map((roomId) => ({
          id: roomId,
          name: getRoomName(roomId, rooms),
        })),
        onEventCode: alarmRule.onEventCode,
        offEventCode: alarmRule.offEventCode,
      }
    : null;

const getAlarmRule = (alarmRule: UiAlarmRule): AlarmRule =>
  alarmRule
    ? {
        alarmType: alarmRule.alarmType,
        severity: alarmRule.alarmSeverity,
        roomIds: alarmRule.rooms.map((room) => room.id),
        onEventCode: alarmRule.onEventCode,
        offEventCode: alarmRule.offEventCode,
      }
    : null;

const getUiAlarmRuleConfig = (config: AlarmRuleConfig, rooms: QuantumRoom[]): UiAlarmRuleConfig => ({
  matching: config.matching.map((alarmRule) => getUiAlarmRule(alarmRule, rooms)),
  fallback: getUiAlarmRule(config.fallback, rooms),
});

const getAlarmRuleConfig = (config: UiAlarmRuleConfig): AlarmRuleConfig => ({
  matching: config.matching.map((alarmRule) => getAlarmRule(alarmRule)),
  fallback: getAlarmRule(config.fallback),
});

@Component({
  selector: 'ats-jnl-alarms-edit',
  templateUrl: './jnl-alarms-edit.component.html',
  styleUrls: ['./jnl-alarms-edit.component.scss'],
})
export class JnlAlarmsEditComponent implements OnInit {
  @Input() config: AlarmRuleConfig;
  @Input() alarmTypes: string[];
  @Input() rooms: QuantumRoom[];
  @Output() save = new EventEmitter<AlarmRuleConfig>();

  uiAlarmRuleConfig: UiAlarmRuleConfig;

  form = new FormGroup({
    matching: new FormArray([]),
  });

  get matching() {
    return this.form.get('matching') as FormArray;
  }

  getRoomIdArray(control: AbstractControl): FormArray {
    return control.get('rooms') as FormArray;
  }

  get eventCodes() {
    return EventCodes;
  }

  ngOnInit(): void {
    this.uiAlarmRuleConfig = getUiAlarmRuleConfig(this.config, this.rooms);

    this.uiAlarmRuleConfig.matching.forEach((alarmRule) => {
      this.matching.push(
        new FormGroup({
          alarmType: new FormControl<string>(alarmRule.alarmType),
          alarmSeverity: new FormControl<AlarmSeverity>(alarmRule.alarmSeverity),
          rooms: new FormArray(alarmRule.rooms.map(this.buildRoomFormGroup)),
          onEventCode: new FormControl<string>(alarmRule.onEventCode),
          offEventCode: new FormControl<string>(alarmRule.offEventCode),
        })
      );
    });
  }

  buildRoomFormGroup(room: QuantumRoom): FormGroup {
    return new FormGroup({
      id: new FormControl(room.id),
      name: new FormControl(room.name),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const uiConfig = this.form.value as UiAlarmRuleConfig;
      this.save.next(getAlarmRuleConfig(uiConfig));
      this.uiAlarmRuleConfig = uiConfig;
    }
  }

  onReset() {
    this.form.setValue(this.uiAlarmRuleConfig);
  }

  getEventCodeName(onCode: string): string {
    return EventCodes.find((eventCode) => eventCode.onCode === onCode).name;
  }

  setOffCode(onCode: string, trigger: AbstractControl): void {
    const eventCode = EventCodes.find((item) => item.onCode === onCode);
    trigger.get('offEventCode').setValue(eventCode.offCode);
  }

  getRooms = (trigger: AbstractControl): QuantumRoom[] | null => {
    const usedRoomIds: number[] = trigger.get('rooms').value.map((room: QuantumRoom) => room.id);
    const rooms = this.rooms.filter((room) => usedRoomIds.indexOf(room.id) === -1);
    return rooms.length === 0 ? null : rooms;
  };

  addRoom(roomId: number, trigger: AbstractControl) {
    const selectedRoom = this.rooms.find((room) => room.id === roomId);
    const roomsArray = trigger.get('rooms') as FormArray;
    roomsArray.push(this.buildRoomFormGroup(selectedRoom));
  }
}
