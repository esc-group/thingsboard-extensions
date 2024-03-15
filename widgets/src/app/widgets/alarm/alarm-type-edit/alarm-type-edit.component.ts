import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ats-alarm-type-edit',
  templateUrl: './alarm-type-edit.component.html',
  styleUrls: ['./alarm-type-edit.component.scss'],
})
export class AlarmTypeEditComponent {
  @Input() alarmTypes: Array<string> = [];
  @Output() alarmTypesChange = new EventEmitter<Array<string>>();
  @ViewChild('alarmTypeInput') alarmTypeInput: ElementRef<HTMLInputElement>;

  addAlarmType() {
    const newAlarmType = this.alarmTypeInput.nativeElement.value.trim();
    if (newAlarmType.length === 0) {
      return;
    }
    this.alarmTypes = Array.from(new Set([...this.alarmTypes, newAlarmType])).sort();
    this.alarmTypesChange.emit(this.alarmTypes);
    this.alarmTypeInput.nativeElement.value = '';
  }

  delAlarmType(alarmType: string) {
    this.alarmTypes = this.alarmTypes.filter((item) => item !== alarmType);
    this.alarmTypesChange.emit(this.alarmTypes);
  }
}
