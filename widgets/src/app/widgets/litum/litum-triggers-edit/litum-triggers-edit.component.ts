import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { AlarmSeverity } from "@shared/public-api";
import { BehaviorSubject, Subscription } from "rxjs";
import * as op from "rxjs/operators";
import { BusinessRule, BusinessRuleMap, UiBusinessRule } from "../models";

@Component({
  selector: "ats-litum-triggers-edit",
  templateUrl: "./litum-triggers-edit.component.html",
  styleUrls: ["./litum-triggers-edit.component.scss"],
})
export class LitumTriggersEditComponent implements OnInit, OnDestroy {
  savedUiRules: UiBusinessRule[] = [];

  triggersGroup = new FormGroup({
    triggerToAdd: new FormControl<number>(0),
    triggers: new FormArray([]),
  });

  get triggersArray() {
    return this.triggersGroup.get("triggers") as FormArray;
  }

  protected subscriptions: Subscription[] = [];

  @Input() rules: BusinessRule[];
  @Input() alarmTypes: string[];
  @Input() config: BusinessRuleMap;
  @Output() save = new EventEmitter<BusinessRuleMap>();

  availableBusinessRules$ = new BehaviorSubject<BusinessRule[]>([]);

  ngOnInit(): void {
    if (
      this.rules === undefined ||
      this.rules === null ||
      this.rules.length === 0
    )
      throw new Error("rules value is invalid");
    if (
      this.alarmTypes === undefined ||
      this.alarmTypes === null ||
      this.alarmTypes.length === 0
    )
      throw new Error("alarmTypes value is invalid");
    if (this.config === undefined || this.config === null)
      throw new Error("config value is invalid");

    const triggers$ = this.triggersArray.valueChanges.pipe(
      op.debounceTime(100)
    );
    this.subscriptions.push(
      triggers$.subscribe(this.recalculateAvailableBusinessRules)
    );
    this.availableBusinessRules$.subscribe((rules) => {
      if (rules.length > 0)
        this.triggersGroup.get("triggerToAdd").setValue(rules[0].id);
    });

    const uiRules = Object.entries(this.config).map(
      ([ruleIdStr, alarmConfig]) => {
        const ruleId = parseInt(ruleIdStr);
        const uiRule: UiBusinessRule = {
          businessRuleId: ruleId,
          businessRuleName: this.getBusinessRuleName(ruleId),
          alarmType: alarmConfig.type,
          alarmSeverity: alarmConfig.severity,
        };
        return uiRule;
      }
    );
    this.savedUiRules = uiRules;
    uiRules.forEach(this.addTriggerToForm);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getBusinessRuleName = (businessRuleId: number): string => {
    const rule = this.rules.find((item) => item.id === businessRuleId);
    return rule ? rule.name : `Rule ${businessRuleId}`;
  };

  addTriggerToForm = (uiRule: UiBusinessRule): void => {
    const triggerGroup = new FormGroup({
      businessRuleId: new FormControl<number>(uiRule.businessRuleId),
      businessRuleName: new FormControl<string>(uiRule.businessRuleName),
      alarmType: new FormControl<string>(uiRule.alarmType),
      alarmSeverity: new FormControl<AlarmSeverity>(uiRule.alarmSeverity),
    });
    this.triggersArray.push(triggerGroup as any as FormControl);
  };

  addTrigger = (businessRuleId: number) => {
    const uiRule: UiBusinessRule = {
      businessRuleId: businessRuleId,
      businessRuleName: this.getBusinessRuleName(businessRuleId),
      alarmSeverity: AlarmSeverity.INDETERMINATE,
      alarmType: this.alarmTypes[0],
    };
    this.addTriggerToForm(uiRule);
  };

  saveTriggers = () => {
    const businessRuleMap: BusinessRuleMap = (
      this.triggersArray.value as UiBusinessRule[]
    ).reduce((prev, rule) => {
      prev[rule.businessRuleId.toString()] = {
        type: rule.alarmType,
        severity: rule.alarmSeverity,
      };
      return prev;
    }, {});
    this.save.next(businessRuleMap);
    this.savedUiRules = this.triggersArray.value;
  };

  resetTriggers = () => {
    this.triggersArray.clear();
    this.savedUiRules.forEach(this.addTriggerToForm);
  };

  recalculateAvailableBusinessRules = () => {
    const usedIds = (this.triggersArray.value as UiBusinessRule[]).map(
      (uiRule) => uiRule.businessRuleId
    );
    const rules: BusinessRule[] = this.rules.filter(
      (rule) => usedIds.indexOf(rule.id) === -1
    );
    this.availableBusinessRules$.next(rules);
  };
}
