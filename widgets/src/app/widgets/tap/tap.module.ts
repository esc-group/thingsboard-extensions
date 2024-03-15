import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';
import { SharedModule } from '@shared/public-api';
import { TapService } from './tap.service';
import { TapEditComponent } from './tap-edit/tap-edit.component';
import { TapPagerViewComponent } from './tap-pager-edit/tap-pager-view.component';
import { TapPagerAddComponent } from './tap-pager-add/tap-pager-add.component';
import { TapGatewayConfigEditComponent } from './tap-gateway-config-edit/tap-gateway-config-edit.component';

@NgModule({
  declarations: [TapEditComponent, TapGatewayConfigEditComponent, TapPagerViewComponent, TapPagerAddComponent],
  exports: [TapEditComponent],
  providers: [TapService],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    MatCommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatExpansionModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTreeModule,
  ],
})
export class TapModule {}
