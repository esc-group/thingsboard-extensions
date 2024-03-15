import { Component, OnInit } from '@angular/core';
import { AppState } from '@core/core.state';
import { Store } from '@ngrx/store';
import { PageComponent } from '@shared/public-api';
import { BehaviorSubject, forkJoin } from 'rxjs';
import * as op from 'rxjs/operators';
import { RtxConfig } from '../models';
import { RtxService } from '../rtx.service';

@Component({
  selector: 'ats-rtx-edit',
  templateUrl: './rtx-edit.component.html',
  styleUrls: ['./rtx-edit.component.scss'],
})
export class RtxEditComponent extends PageComponent implements OnInit {
  gatewayId$ = new BehaviorSubject<string>(null);
  rtxConfig$ = new BehaviorSubject<RtxConfig>(null);

  constructor(
    protected store: Store<AppState>,
    private rtxService: RtxService
  ) {
    super(store);
  }

  ngOnInit(): void {
    const sub = this.rtxService
      .getGatewayId('RTX Gateway')
      .pipe(
        op.tap((gatewayId) => {
          this.gatewayId$.next(gatewayId);
        }),
        op.switchMap((gatewayId) =>
          forkJoin([
            this.rtxService.getRtxConfig(gatewayId).pipe(
              op.tap((config) => {
                this.rtxConfig$.next(config);
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

  onRtxSave = (config: RtxConfig): void => {
    const sub = this.rtxService.setRtxConfig(this.gatewayId$.value, config).subscribe({
      complete: () => {
        sub.unsubscribe();
      },
    });
  };
}
