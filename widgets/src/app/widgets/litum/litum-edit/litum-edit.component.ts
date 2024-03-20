import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppState } from '@core/core.state';
import { WidgetContext } from '@home/models/widget-component.models';
import { Store } from '@ngrx/store';
import { PageComponent } from '@shared/public-api';
import { BehaviorSubject, forkJoin, of, Subscription } from 'rxjs';
import * as op from 'rxjs/operators';
import { AlarmTypeEditComponent } from '../../alarm/alarm-type-edit/alarm-type-edit.component';
import { LitumService } from '../litum.service';
import { BusinessRule, GatewayConfig, LitumConfig, AlarmConfig } from '../models';

@Component({
  selector: 'ats-litum-edit',
  templateUrl: './litum-edit.component.html',
  styleUrls: ['./litum-edit.component.scss'],
})
export class LitumEditComponent extends PageComponent implements OnInit, OnDestroy {
  @ViewChild('businessRulesError')
  businessRulesError: ElementRef<HTMLParagraphElement>;
  @ViewChild('userAlarmTypes') userAlarmTypes: AlarmTypeEditComponent;

  protected subscriptions: Subscription[] = [];
  protected gatewayName: string;
  protected ctx: WidgetContext;

  isLoadingLitumConfig$ = new BehaviorSubject<boolean>(true);
  isLoadingGatewayConfig$ = new BehaviorSubject<boolean>(true);
  isLoadingBusinessRules$ = new BehaviorSubject<boolean>(true);
  isSaving$ = new BehaviorSubject<boolean>(false);
  businessRulesError$ = new BehaviorSubject<string>('');
  litumId$ = new BehaviorSubject<string>('');
  triggersConfig$ = new BehaviorSubject<AlarmConfig[]>(null);
  userAlarmTypes$ = new BehaviorSubject<string[]>([]);
  recentAlarmTypes$ = new BehaviorSubject<string[]>([]);
  configuredAlarmTypes$ = new BehaviorSubject<string[]>([]);
  combinedAlarmTypes$ = new BehaviorSubject<string[]>([]);
  allBusinessRules$ = new BehaviorSubject<BusinessRule[]>([]);
  litumConfig$ = new BehaviorSubject<LitumConfig>(null);
  gatewayConfig$ = new BehaviorSubject<GatewayConfig>(null);

  constructor(
    protected store: Store<AppState>,
    private litumService: LitumService,
    @Inject('widgetContext') widgetContext: any, // proper type hint here will break the module
    @Inject('gatewayName') gatewayName: string
  ) {
    super(store);
    this.gatewayName = gatewayName;
    this.ctx = widgetContext;
  }

  ngOnInit(): void {
    this.loadFromService();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  userAlarmTypesChanged = () => {
    this.userAlarmTypes$.next(this.userAlarmTypes.alarmTypes);
  };

  recalculateAlarmTypes = () => {
    const combinedAlarmTypes = Array.from(
      new Set([...this.recentAlarmTypes$.value, ...this.userAlarmTypes$.value, ...this.configuredAlarmTypes$.value])
    ).sort();
    this.combinedAlarmTypes$.next(combinedAlarmTypes);
  };

  alarmConfigChanged = (alarmConfig: AlarmConfig[]) => {
    if (alarmConfig !== null) this.configuredAlarmTypes$.next(alarmConfig.map((item: AlarmConfig) => item.alarmType));
  };

  loadFromService = (): void => {
    this.userAlarmTypes$.subscribe(this.recalculateAlarmTypes);
    this.recentAlarmTypes$.subscribe(this.recalculateAlarmTypes);
    this.configuredAlarmTypes$.subscribe(this.recalculateAlarmTypes);
    this.triggersConfig$.subscribe(this.alarmConfigChanged);
    this.isLoadingLitumConfig$.next(true);
    this.isLoadingGatewayConfig$.next(true);
    this.isLoadingBusinessRules$.next(true);
    this.businessRulesError$.next('');
    const subscription = this.litumService
      .getGatewayId(this.gatewayName)
      .pipe(
        op.tap((litumId) => {
          this.litumId$.next(litumId);
        }),
        op.switchMap((litumId) =>
          forkJoin([
            this.litumService.getLitumConfig(litumId).pipe(
              op.tap((config) => {
                this.litumConfig$.next(config);
                this.isLoadingLitumConfig$.next(false);
              })
            ),
            this.litumService.getGatewayConfig(litumId).pipe(
              op.tap((config) => {
                this.gatewayConfig$.next(config);
                this.isLoadingGatewayConfig$.next(false);
              })
            ),
            this.litumService.getBusinessRules(litumId).pipe(
              op.tap((businessRules: BusinessRule[]) => {
                this.allBusinessRules$.next(businessRules);
              }),
              op.catchError((err) => {
                const errorMessage = 'Unable to retrieve business rules from remote Litum server.';
                this.ctx.showToast('error', errorMessage, 3000, 'top', 'center', 'dashboardDialog');
                this.businessRulesError$.next(errorMessage);
                return of(err);
              })
            ),
            this.litumService.getAlarmTypes(30).pipe(
              op.tap((alarmTypes) => {
                this.recentAlarmTypes$.next(alarmTypes);
              })
            ),
            this.litumService.getAlarmConfig(litumId).pipe(
              op.tap((config: AlarmConfig[]) => {
                this.triggersConfig$.next(config);
              })
            ),
          ])
        )
      )
      .subscribe({
        next: () => {
          this.isLoadingBusinessRules$.next(false);
        },
        error: (error: Error) => {
          this.businessRulesError$.next(`Load failure: ${error.message}`);
        },
        complete: () => {
          subscription.unsubscribe();
        },
      });
  };

  onTriggersSave = (config: AlarmConfig[]): void => {
    if (this.isSaving$.value) {
      return;
    }
    this.isSaving$.next(true);
    const saveSubscription = this.litumService.setAlarmConfig(this.litumId$.value, config).subscribe({
      next: () => {
        this.triggersConfig$.next(config);
        this.ctx.showSuccessToast('Save success', 3e3, 'bottom', 'center', 'triggers-save');
      },
      error: () => {
        this.ctx.showErrorToast('Save failed', 'bottom', 'center', 'triggers-save');
      },
      complete: () => {
        this.isSaving$.next(false);
        saveSubscription.unsubscribe();
      },
    });
  };

  onGatewaySave = (config: GatewayConfig): void => {
    const saveSubscription = this.litumService.setGatewayConfig(this.litumId$.value, config).subscribe({
      complete: () => {
        saveSubscription.unsubscribe();
      },
    });
  };

  onLitumSave = (config: LitumConfig): void => {
    const saveSubscription = this.litumService.setLitumConfig(this.litumId$.value, config).subscribe({
      complete: () => {
        saveSubscription.unsubscribe();
      },
    });
  };
}
