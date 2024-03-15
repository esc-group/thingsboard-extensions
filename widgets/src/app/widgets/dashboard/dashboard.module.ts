import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '@shared/public-api';
import { JnlModule } from '../jnl/jnl.module';
import { LitumModule } from '../litum/litum.module';
import { MessengerModule } from '../messenger/messenger.module';
import { RtxModule } from '../rtx/rtx.module';
import { SpectralinkModule } from '../spectralink/spectralink.module';
import { TapModule } from '../tap/tap.module';
import { ModalModule } from './modal';
import { GatewayConfigComponent } from './gateway-config/gateway-config.component';

@NgModule({
  declarations: [GatewayConfigComponent],
  imports: [
    CommonModule,
    SharedModule,
    ModalModule,
    FlexLayoutModule,
    MatIconModule,
    MatCommonModule,
    MatButtonModule,
    JnlModule,
    LitumModule,
    MessengerModule,
    SpectralinkModule,
    RtxModule,
    TapModule,
  ],
  exports: [GatewayConfigComponent],
})
export class DashboardModule {}
