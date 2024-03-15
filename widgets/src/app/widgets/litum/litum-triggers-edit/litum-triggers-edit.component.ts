import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { AlarmSeverity } from '@shared/public-api';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';
import { AlarmConfig, BusinessRule, UiAlarmConfig } from '../models';

@Component({
  selector: 'ats-litum-triggers-edit',
  templateUrl: './litum-triggers-edit.component.html',
  styleUrls: ['./litum-triggers-edit.component.scss'],
})
export class LitumTriggersEditComponent implements OnInit, OnDestroy, OnChanges {
  savedUiRules: UiAlarmConfig[] = [];

  formGroup = new FormGroup({
    triggerToAdd: new FormControl<number>(0),
    triggers: new FormArray([]),
  });

  get triggersArray() {
    return this.formGroup.get('triggers') as FormArray;
  }

  protected subscriptions: Subscription[] = [];

  @Input() businessRules: BusinessRule[];
  @Input() alarmTypes: string[];
  @Input() alarmConfig: AlarmConfig[];
  @Output() save = new EventEmitter<AlarmConfig[]>();

  availableBusinessRules$ = new BehaviorSubject<BusinessRule[]>([]);

  ngOnInit(): void {
    if (this.businessRules === undefined || this.businessRules === null || this.businessRules.length === 0) {
      throw new Error('rules value is invalid');
    }
    if (this.alarmTypes === undefined || this.alarmTypes === null || this.alarmTypes.length === 0) {
      throw new Error('alarmTypes value is invalid');
    }
    if (this.alarmConfig === undefined || this.alarmConfig === null) {
      throw new Error('config value is invalid');
    }
    console.log('LitumTriggersEditComponent.ngOnInit() alarmConfig', this.alarmConfig);
    const triggers$ = this.triggersArray.valueChanges.pipe(op.debounceTime(100));
    this.subscriptions.push(triggers$.subscribe(this.recalculateAvailableBusinessRules));
    this.subscriptions.push(this.availableBusinessRules$.subscribe(this.autoSelectFirstRule));
    this.recalculateAvailableBusinessRules(); // so initial values are set and proper GUI widgets show
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.alarmConfig) {
      return;
    }
    console.log('LitumTriggersEditComponent.ngOnChanges() alarmConfig', this.alarmConfig);
    const uiAlarmConfigs: UiAlarmConfig[] = this.alarmConfig.map((alarmConfig) => ({
      ...alarmConfig,
      businessRuleName: this.getBusinessRuleName(alarmConfig.businessRuleId),
    }));
    console.log('LitumTriggersEditComponent.ngOnChanges() uiAlarmConfigs', uiAlarmConfigs);
    this.savedUiRules = uiAlarmConfigs;
    uiAlarmConfigs.forEach(this.addTriggerToForm);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getBusinessRuleName = (businessRuleId: number): string => {
    const rule = this.businessRules.find((item) => item.id === businessRuleId);
    return rule ? rule.name : `Rule ${businessRuleId}`;
  };

  addTriggerToForm = (uiAlarmConfig: UiAlarmConfig): void => {
    const triggerGroup = new FormGroup({
      businessRuleId: new FormControl<number>(uiAlarmConfig.businessRuleId),
      businessRuleName: new FormControl<string>(uiAlarmConfig.businessRuleName),
      alarmType: new FormControl<string>(uiAlarmConfig.alarmType),
      alarmSeverity: new FormControl<AlarmSeverity>(uiAlarmConfig.alarmSeverity),
    });
    console.log('addTriggerToForm adding', triggerGroup);
    this.triggersArray.push(triggerGroup as any as FormControl);
  };

  addTrigger = (businessRuleId: number) => {
    const uiRule: UiAlarmConfig = {
      businessRuleId,
      businessRuleName: this.getBusinessRuleName(businessRuleId),
      alarmSeverity: AlarmSeverity.INDETERMINATE,
      alarmType: this.alarmTypes[0],
    };
    this.addTriggerToForm(uiRule);
  };

  saveTriggers = () => {
    const uiAlarmConfigs: UiAlarmConfig[] = this.triggersArray.value;
    const alarmConfigs: AlarmConfig[] = uiAlarmConfigs.map(
      ({ businessRuleId, alarmType, alarmSeverity }: UiAlarmConfig) =>
        ({
          businessRuleId,
          alarmType,
          alarmSeverity,
        }) as AlarmConfig
    );
    this.save.next(alarmConfigs);
    this.savedUiRules = this.triggersArray.value;
  };

  resetTriggers = () => {
    this.triggersArray.clear();
    this.savedUiRules.forEach(this.addTriggerToForm);
  };

  recalculateAvailableBusinessRules = () => {
    const usedIds = (this.triggersArray.value as UiAlarmConfig[]).map((uiRule) => uiRule.businessRuleId);
    const rules: BusinessRule[] = this.businessRules.filter((rule) => usedIds.indexOf(rule.id) === -1);
    this.availableBusinessRules$.next(rules);
  };

  autoSelectFirstRule = (businessRules: BusinessRule[]): void => {
    if (businessRules.length > 0) {
      this.formGroup.get('triggerToAdd').setValue(businessRules[0].id);
    }
  };
}
