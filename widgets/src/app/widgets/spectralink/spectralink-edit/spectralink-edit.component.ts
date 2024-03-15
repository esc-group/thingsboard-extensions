import { Component, OnInit } from '@angular/core';
import { AppState } from '@core/core.state';
import { Store } from '@ngrx/store';
import { PageComponent } from '@shared/public-api';
import { BehaviorSubject, forkJoin } from 'rxjs';
import * as op from 'rxjs/operators';
import { HandsetConfig, ServerConfig } from '../models';
import { SpectralinkService } from '../spectralink.service';

@Component({
  selector: 'ats-spectralink-edit',
  templateUrl: './spectralink-edit.component.html',
  styleUrls: ['./spectralink-edit.component.scss'],
})
export class SpectralinkEditComponent extends PageComponent implements OnInit {
  gatewayId$ = new BehaviorSubject<string>(null);
  serverConfig$ = new BehaviorSubject<ServerConfig>(null);
  handsetConfig$ = new BehaviorSubject<HandsetConfig>(null);

  constructor(
    protected store: Store<AppState>,
    private spectralinkService: SpectralinkService
  ) {
    super(store);
  }

  ngOnInit(): void {
    const sub = this.spectralinkService
      .getGatewayId('Spectralink Gateway')
      .pipe(
        op.tap((gatewayId) => {
          this.gatewayId$.next(gatewayId);
        }),
        op.switchMap((gatewayId) =>
          forkJoin([
            this.spectralinkService.getServerConfig(gatewayId).pipe(
              op.tap((config) => {
                this.serverConfig$.next(config);
              })
            ),
            this.spectralinkService.getHandsetConfig(gatewayId).pipe(
              op.tap((config) => {
                this.handsetConfig$.next(config);
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

  onServerConfigSave = (config: ServerConfig): void => {
    const sub = this.spectralinkService.setServerConfig(this.gatewayId$.value, config).subscribe({
      complete: () => {
        sub.unsubscribe();
      },
    });
  };

  onHandsetConfigSave = (config: HandsetConfig): void => {
    const sub = this.spectralinkService.setHandsetConfig(this.gatewayId$.value, config).subscribe({
      complete: () => {
        sub.unsubscribe();
      },
    });
  };
}
