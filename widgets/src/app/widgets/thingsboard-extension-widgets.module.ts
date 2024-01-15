import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@shared/public-api";

import { AlarmModule } from "./alarm/alarm.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { JnlModule } from "./jnl/jnl.module";
import { LitumModule } from "./litum/litum.module";
import { MessengerModule } from "./messenger/messenger.module";
import { RtxModule } from "./rtx/rtx.module";
import { SpectralinkModule } from "./spectralink/spectralink.module";
import { TapModule } from "./tap/tap.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule],
  exports: [
    AlarmModule,
    DashboardModule,
    JnlModule,
    LitumModule,
    MessengerModule,
    RtxModule,
    SpectralinkModule,
    TapModule,
  ],
})
export class ThingsboardExtensionWidgetsModule {
  constructor() {}
}
