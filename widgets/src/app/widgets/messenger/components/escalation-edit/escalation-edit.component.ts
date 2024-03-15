import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControlStatus } from '@angular/forms';
import { AppState } from '@core/core.state';
import { guid } from '@core/public-api';
import { WidgetContext } from '@home/models/widget-component.models';
import { Store } from '@ngrx/store';
import { PageComponent } from '@shared/public-api';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';
import { AlarmTypeEditComponent } from '../../../alarm/alarm-type-edit/alarm-type-edit.component';
import { MessengerService } from '../../messenger.service';
import { EscalationConfig } from '../../models/escalation.models';
import * as EscalationActions from '../../store/actions';
import * as Selector from '../../store/selectors';
import { SubEntity, UiEscalationGroup, UiEscalationLevel } from '../../store/state';

@Component({
  selector: 'ats-escalation-edit',
  templateUrl: './escalation-edit.component.html',
  styleUrls: ['./escalation-edit.component.scss'],
})
export class EscalationEditComponent extends PageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ctx: WidgetContext;
  @ViewChild('userAlarmTypes') userAlarmTypes: AlarmTypeEditComponent;

  isLoading$ = this.store.select(Selector.isLoading);
  loadError$ = this.store.select(Selector.loadError);

  isSaving$ = new BehaviorSubject<boolean>(false);
  saveError$ = this.store.select(Selector.saveError);

  selectedLevel$ = this.store.select(Selector.selectedLevel);
  levels$ = this.store.select(Selector.levels);
  groups$ = this.store.select(Selector.groups);
  selectedGroup$ = this.store.select(Selector.selectedGroup);
  selectedGroupUsedByLevels$ = this.store.select(Selector.selectedGroupUsedByLevels);
  disableLevelRemoval$ = this.store.select(Selector.selectedLevelIsSafeToRemove);
  devices$ = this.store.select(Selector.outputDeviceList);

  protected addLevelCounter = 0;
  protected addGroupCounter = 0;

  protected isLevelValid$ = new BehaviorSubject<boolean>(false);
  protected saveDisabled$ = new BehaviorSubject<boolean>(true);

  protected static DefaultNewLevel: UiEscalationLevel = {
    id: '',
    name: '',
    next: '',
    timeout: 120,
    acceptedTimeout: 0,
    dispatch: { 'en-US': 'Dispatching {alarm.type}' },
    accept: { 'en-US': 'Accepted {alarm.type}' },
    cancel: { 'en-US': 'Cancelled {alarm.type}' },
    alarms: [],
    devices: [],
    groups: [],
  };

  protected subscriptions: Subscription[] = [];

  constructor(
    protected store: Store<AppState>,
    private escalationService: MessengerService
  ) {
    super(store);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('EE ngOnChanges', changes);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    const storeIsSaving$ = this.store.select(Selector.isSaving);
    this.subscriptions.push(storeIsSaving$.subscribe(this.isSaving$));
    this.subscriptions.push(storeIsSaving$.subscribe(this.recomputeSaveDisabled));

    this.store.dispatch(EscalationActions.setLoading());
    const subscription = this.escalationService
      .getGatewayId('Messenger Gateway')
      .pipe(
        op.tap((messengerId) => {
          this.store.dispatch(EscalationActions.setMessengerId({ messengerId }));
        }),
        op.switchMap((messengerId) =>
          forkJoin([
            this.escalationService.getEscalationConfig(messengerId).pipe(
              op.tap((config: EscalationConfig) => {
                console.log('escalationConfig', config);
                this.store.dispatch(EscalationActions.setEscalationConfig(config));
              })
            ),
            this.escalationService.getAlarmTypes(7).pipe(
              op.tap((alarmTypes) => {
                this.store.dispatch(EscalationActions.setRecentAlarmTypes({ alarmTypes }));
              })
            ),
            this.escalationService.getOutputGatewayDevices(messengerId).pipe(
              op.tap((devices) => {
                this.store.dispatch(EscalationActions.setOutputDevices({ devices }));
              })
            ),
          ])
        ),
        op.exhaustAll()
      )
      .subscribe({
        next: () => {
          this.store.dispatch(EscalationActions.setLoadSuccess());
        },
        error: (error: Error) => {
          this.store.dispatch(EscalationActions.setLoadError({ loadError: error.message }));
        },
        complete: () => subscription.unsubscribe(),
      });
  }

  addEscalationLevel() {
    this.addLevelCounter += 1;
    this.store.dispatch(
      EscalationActions.addLevel({
        level: {
          ...EscalationEditComponent.DefaultNewLevel,
          id: guid(),
          name: 'New Level ' + this.addLevelCounter,
        },
      })
    );
  }

  addEscalationGroup(): void {
    this.addGroupCounter += 1;
    const group: UiEscalationGroup = {
      id: guid(),
      name: 'New Group ' + this.addGroupCounter,
      devices: [],
    };
    this.store.dispatch(EscalationActions.addGroup({ group }));
  }

  setSelectedLevel(level: UiEscalationLevel): void {
    console.log(`setSelectedLevel "${level ? level.name : 'null'}"`);
    this.store.dispatch(EscalationActions.setSelectedLevel({ level }));
  }

  setSelectedGroup(group: UiEscalationGroup): void {
    console.log(`setSelectedGroup "${group ? group.name : 'null'}"`);
    this.store.dispatch(EscalationActions.setSelectedGroup({ group }));
  }

  addDeviceToGroup(device: SubEntity): void {
    console.log(`>> adding ${device.name} to selected group`);
    this.store.dispatch(EscalationActions.addDeviceToGroup({ device }));
  }

  removeDeviceFromGroup(device: SubEntity): void {
    console.log(`>> removing ${device.name} from selected group`);
    this.store.dispatch(EscalationActions.removeDeviceFromGroup({ device }));
  }

  removeSelectedGroup(): void {
    this.store.dispatch(EscalationActions.deleteGroup());
  }

  resetClicked(): void {
    this.store.dispatch(EscalationActions.reset());
  }

  saveClicked(): void {
    console.log('saveClicked()');
    this.store.dispatch(EscalationActions.setSaving());
    const subscription = this.store
      .select(Selector.saveData)
      .pipe(
        op.first(),
        op.switchMap((data) => {
          this.store.dispatch(EscalationActions.setSaving());
          return this.escalationService
            .saveEscalationConfig(data.config, data.messengerId)
            .pipe(op.map(() => data.config));
        })
      )
      .subscribe({
        next: (savedConfig) => {
          console.log('Save success', savedConfig);
          this.store.dispatch(EscalationActions.setSaveSuccess());
        },
        error: (error: Error) => {
          console.log('Save error', error);
          this.store.dispatch(EscalationActions.setSaveError({ saveError: error.message }));
          throw error;
        },
        complete: () => subscription.unsubscribe(),
      });
  }

  removeSelectedLevel(): void {
    this.store.dispatch(EscalationActions.deleteLevel());
  }

  levelStatusChanged = (status: FormControlStatus): void => {
    const isValid = status === 'VALID';
    if (this.isLevelValid$.value !== isValid) {
      this.isLevelValid$.next(isValid);
      this.recomputeSaveDisabled();
    }
  };

  recomputeSaveDisabled = (): void => {
    if (this.isSaving$.value === true) {
      if (this.saveDisabled$.value === false) {
        this.saveDisabled$.next(true);
      }
    } else if (this.saveDisabled$.value === this.isLevelValid$.value) {
      this.saveDisabled$.next(!this.isLevelValid$.value);
    }
  };

  userAlarmTypesChanged = () => {
    this.store.dispatch(
      EscalationActions.setUserAlarmTypes({
        alarmTypes: this.userAlarmTypes.alarmTypes,
      })
    );
  };
}
