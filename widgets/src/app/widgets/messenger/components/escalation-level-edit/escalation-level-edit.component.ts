import { Component, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormControlStatus, FormGroup, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { AppState } from '@core/core.state';
import { Store } from '@ngrx/store';
import * as EscalationActions from '../../store/actions';
import * as Selector from '../../store/selectors';
import { Observable, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';

interface Language {
  id: string;
  name: string;
}

@Component({
  selector: 'ats-escalation-level-edit',
  templateUrl: './escalation-level-edit.component.html',
  styleUrls: ['./escalation-level-edit.component.scss'],
})
export class EscalationLevelEditComponent implements OnDestroy, OnInit, OnChanges {
  public readonly cls = EscalationLevelEditComponent;

  public static readonly FC_NAME = 'name';
  public static readonly FC_TIMEOUT = 'timeout';
  public static readonly FC_ACCEPTED_TIMEOUT = 'acceptedTimeout';
  public static readonly FC_NEXT = 'next';
  public static readonly FC_DISPATCH_TEMPLATE = 'dispatchTemplate';
  public static readonly FC_ACCEPT_TEMPLATE = 'acceptTemplate';
  public static readonly FC_CANCEL_TEMPLATE = 'cancelTemplate';

  public static readonly LANGUAGES: Language[] = [
    { id: 'en-US', name: 'English USA' },
    { id: 'fr-CA', name: 'French Canadian' },
  ];
  public static readonly DEFAULT_LANGUAGE = 'en-US';
  public selectedLanguage: string = EscalationLevelEditComponent.DEFAULT_LANGUAGE;

  protected fcName = new FormControl<string>('', [Validators.required, Validators.minLength(1)]);
  protected fcTimeout = new FormControl<number>(60, [Validators.required, Validators.min(10), Validators.max(3600)]);
  protected fcAcceptedTimeout = new FormControl<number>(0, [
    Validators.required,
    Validators.min(0),
    Validators.max(3600),
  ]);
  protected fcNext = new FormControl<string>('', []);
  protected fcDispatchTemplate = new FormControl<string>('', [Validators.required, Validators.minLength(1)]);
  protected fcAcceptTemplate = new FormControl<string>('', [Validators.required, Validators.minLength(1)]);
  protected fcCancelTemplate = new FormControl<string>('', [Validators.required, Validators.minLength(1)]);

  protected formGroup: FormGroup = new FormGroup({
    [EscalationLevelEditComponent.FC_NAME]: this.fcName,
    [EscalationLevelEditComponent.FC_TIMEOUT]: this.fcTimeout,
    [EscalationLevelEditComponent.FC_ACCEPTED_TIMEOUT]: this.fcAcceptedTimeout,
    [EscalationLevelEditComponent.FC_NEXT]: this.fcNext,
    [EscalationLevelEditComponent.FC_DISPATCH_TEMPLATE]: this.fcDispatchTemplate,
    [EscalationLevelEditComponent.FC_ACCEPT_TEMPLATE]: this.fcAcceptTemplate,
    [EscalationLevelEditComponent.FC_CANCEL_TEMPLATE]: this.fcCancelTemplate,
  });
  protected selectedLevelId?: string = '';
  protected subscriptions: Subscription[] = [];

  selectedLevel$ = this.store.select(Selector.selectedLevel);
  usedByLevels$ = this.store.select(Selector.selectedLevelUsedByLevels);
  allLevelNames$ = this.store.select(Selector.levelNames);
  allGroupNames$ = this.store.select(Selector.groupNames);
  allDevices$ = this.store.select(Selector.outputDeviceList);
  allAlarmTypes$ = this.store.select(Selector.combinedAlarmTypes);

  @Output() status: Observable<FormControlStatus> = this.formGroup.statusChanges;

  constructor(protected store: Store<AppState>) {}

  ngOnInit(): void {
    this.subscriptions.push(
      // this.selectedLevel$.pipe(op.first()).subscribe((level) => {
      this.selectedLevel$.pipe(op.filter((level) => level !== null)).subscribe((level) => {
        console.log('ngOnInit->selectedLevel$', level);
        if (level.id !== this.selectedLevelId) {
          this.selectedLevelId = level.id;
          this.selectedLanguage = EscalationLevelEditComponent.DEFAULT_LANGUAGE;
        }
        if (this.fcName.value != level.name) this.fcName.setValue(level.name);
        if (this.fcTimeout.value != level.timeout) this.fcTimeout.setValue(level.timeout);
        if (this.fcAcceptedTimeout.value != level.acceptedTimeout)
          this.fcAcceptedTimeout.setValue(level.acceptedTimeout);
        if (this.fcNext.value != level.next) this.fcNext.setValue(level.next);
        if (this.fcDispatchTemplate.value != level.dispatch[this.selectedLanguage])
          this.fcDispatchTemplate.setValue(level.dispatch[this.selectedLanguage]);
        if (this.fcAcceptTemplate.value != level.accept[this.selectedLanguage])
          this.fcAcceptTemplate.setValue(level.accept[this.selectedLanguage]);
        if (this.fcCancelTemplate.value != level.cancel[this.selectedLanguage])
          this.fcCancelTemplate.setValue(level.cancel[this.selectedLanguage]);
      }),
      this.fcName.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setLevelName),
      this.fcTimeout.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setLevelTimeout),
      this.fcAcceptedTimeout.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setLevelAcceptedTimeout),
      this.fcNext.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setLevelNext),
      this.fcDispatchTemplate.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setDispatchTemplate),
      this.fcAcceptTemplate.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setAcceptTemplate),
      this.fcCancelTemplate.valueChanges.pipe(op.debounceTime(750)).subscribe(this.setCancelTemplate)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("ELE ngOnChanges", changes)
  }

  deviceSelectionChange = (change: MatSelectionListChange): void => {
    change.options.forEach((option) => {
      const action = option.selected ? EscalationActions.addDeviceToLevel : EscalationActions.removeDeviceFromLevel;
      this.store.dispatch(action({ device: option.value }));
    });
  };

  groupSelectionChange = (change: MatSelectionListChange): void => {
    change.options.forEach((option) => {
      const action = option.selected ? EscalationActions.addGroupToLevel : EscalationActions.removeGroupFromLevel;
      this.store.dispatch(action({ group: option.value }));
    });
  };

  alarmSelectionChange = (change: MatSelectionListChange): void => {
    change.options.forEach((option) => {
      const action = option.selected ? EscalationActions.addAlarmToLevel : EscalationActions.removeAlarmFromLevel;
      this.store.dispatch(action({ alarm: option.value }));
    });
  };

  setLevelName = (name: string): void => {
    if (this.fcName.valid) {
      console.log('name is now ' + name);
      this.store.dispatch(EscalationActions.setLevelName({ name }));
    }
  };

  setLevelTimeout = (timeout: number): void => {
    if (this.fcTimeout.valid) {
      console.log('timeout is now ' + timeout);
      this.store.dispatch(EscalationActions.patchLevel({ patch: { timeout } }));
    }
  };
  setLevelNext = (next: string): void => {
    if (this.fcNext.valid) {
      console.log('next is now ' + next);
      this.store.dispatch(EscalationActions.patchLevel({ patch: { next } }));
    }
  };

  setLevelAcceptedTimeout = (acceptedTimeout: number): void => {
    if (this.fcAcceptedTimeout.valid) {
      console.log('accepted timeout is now ' + acceptedTimeout);
      this.store.dispatch(EscalationActions.patchLevel({ patch: { acceptedTimeout } }));
    }
  };

  setDispatchTemplate = (template: string): void => {
    if (this.fcDispatchTemplate.valid) {
      console.log('dispatch template is now ' + template);
      this.store.dispatch(
        EscalationActions.setDispatchTemplate({
          language: this.selectedLanguage,
          template,
        })
      );
    }
  };

  setAcceptTemplate = (template: string): void => {
    if (this.fcDispatchTemplate.valid) {
      console.log('accept template is now ' + template);
      this.store.dispatch(
        EscalationActions.setAcceptTemplate({
          language: this.selectedLanguage,
          template,
        })
      );
    }
  };

  setCancelTemplate = (template: string): void => {
    if (this.fcDispatchTemplate.valid) {
      console.log('cancel template is now ' + template);
      this.store.dispatch(
        EscalationActions.setCancelTemplate({
          language: this.selectedLanguage,
          template,
        })
      );
    }
  };
}
