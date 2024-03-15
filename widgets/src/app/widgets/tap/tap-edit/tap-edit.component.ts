import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as op from 'rxjs/operators';
import { TapGateway, TapPager } from '../models';
import { AddPagerData } from '../tap-pager-add/tap-pager-add.component';
import { TapService } from '../tap.service';

@Component({
  selector: 'ats-tap-edit',
  templateUrl: './tap-edit.component.html',
  styleUrls: ['./tap-edit.component.scss'],
})
export class TapEditComponent implements OnInit {
  gatewayName: string;
  tapGateway$ = new BehaviorSubject<TapGateway | null>(null);
  tapPagers$ = new BehaviorSubject<TapPager[]>([]);

  constructor(
    protected tapService: TapService,
    @Inject('widgetContext') widgetContext: any, // proper type hint here will break the module
    @Inject('gatewayName') gatewayName: string
  ) {
    this.gatewayName = gatewayName;
  }

  ngOnInit(): void {
    const sub = this.tapService
      .getTapGateway(this.gatewayName)
      .pipe(
        op.switchMap((gateway: TapGateway) =>
          this.tapService
            .getTapPagers(gateway.deviceId)
            .pipe(op.map((pagers) => ({ gateway: gateway, pagers: pagers })))
        )
      )
      .subscribe({
        next: ({ gateway, pagers }) => {
          console.log('Successfully got ', gateway, pagers);
          this.tapGateway$.next(gateway);
          this.tapPagers$.next(pagers);
        },
        complete: () => {
          sub?.unsubscribe();
        },
      });
  }

  saveGateway = (gateway: TapGateway): void => {
    const sub = this.tapService.saveTapGateway(gateway).subscribe({
      complete: () => {
        sub?.unsubscribe();
      },
    });
  };

  addPager = (addPager: AddPagerData) => {
    const subscription = this.tapService
      .addPager(this.tapGateway$.value.deviceId, addPager.pagerName, addPager.pagerNumber)
      .subscribe({
        next: (device) => {
          const newPager: TapPager = {
            deviceId: device.id.id,
            deviceName: addPager.pagerName,
            pagerNumber: addPager.pagerNumber,
            gatewayId: this.tapGateway$.value.deviceId,
          };
          this.tapPagers$.next([...this.tapPagers$.value, newPager]);
        },
        complete: () => {
          subscription?.unsubscribe();
        },
      });
  };

  deletePager = (pager: TapPager) => {
    const subscription = this.tapService.deletePager(pager.deviceId).subscribe({
      next: (device) => {
        this.tapPagers$.next(this.tapPagers$.value.filter((pager_) => pager_.deviceId !== pager.deviceId));
      },
      complete: () => {
        subscription?.unsubscribe();
      },
    });
  };
}
