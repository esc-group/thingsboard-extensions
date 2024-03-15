import { Component, OnInit } from '@angular/core';
import { AppState } from '@core/core.state';
import { Store } from '@ngrx/store';
import { PageComponent } from '@shared/public-api';
import { BehaviorSubject, forkJoin } from 'rxjs';
import * as op from 'rxjs/operators';
import { JnlService } from '../jnl-service';
import { AlarmRuleConfig, QuantumConfig, QuantumRoom } from '../models';

@Component({
  selector: 'ats-jnl-edit',
  templateUrl: './jnl-edit.component.html',
  styleUrls: ['./jnl-edit.component.scss'],
})
export class JnlEditComponent extends PageComponent implements OnInit {
  gatewayId$ = new BehaviorSubject<string>(null);
  alarmsConfig$ = new BehaviorSubject<AlarmRuleConfig>(null);
  quantumConfig$ = new BehaviorSubject<QuantumConfig>(null);
  alarmTypes$ = new BehaviorSubject<string[]>(null);
  rooms$ = new BehaviorSubject<QuantumRoom[]>(null);

  constructor(
    protected store: Store<AppState>,
    private jnlService: JnlService
  ) {
    super(store);
  }

  ngOnInit(): void {
    const sub = this.jnlService
      .getGatewayId('JNL Gateway')
      .pipe(
        op.tap((gatewayId) => {
          this.gatewayId$.next(gatewayId);
        }),
        op.switchMap((gatewayId) =>
          forkJoin([
            this.jnlService.getQuantumConfig(gatewayId).pipe(
              op.tap((config) => {
                this.quantumConfig$.next(config);
              })
            ),
            this.jnlService.getAlarmRuleConfig(gatewayId).pipe(
              op.tap((config) => {
                this.alarmsConfig$.next(config);
              })
            ),
            this.jnlService.getAlarmTypes(30).pipe(
              op.tap((alarmTypes) => {
                this.alarmTypes$.next(alarmTypes);
              })
            ),
            this.jnlService.getQuantumRooms(gatewayId).pipe(
              op.tap((rooms) => {
                this.rooms$.next(rooms);
              })
            ),
          ])
        )
      )
      .subscribe({
        complete: () => {
          sub.unsubscribe();
        },
      });
  }

  onAlarmsSave = (config: AlarmRuleConfig): void => {
    const sub = this.jnlService.setAlarmRuleConfig(this.gatewayId$.value, config).subscribe({
      complete: () => {
        sub.unsubscribe();
      },
    });
  };

  onQuantumSave = (config: QuantumConfig): void => {
    const sub = this.jnlService.setQuantumConfig(this.gatewayId$.value, config).subscribe({
      complete: () => {
        sub.unsubscribe();
      },
    });
  };
}
