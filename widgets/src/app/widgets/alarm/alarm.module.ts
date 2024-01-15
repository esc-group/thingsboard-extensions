import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatCommonModule } from "@angular/material/core";
import { MatListModule } from "@angular/material/list";
import { SharedModule } from "@shared/public-api";
import { AlarmTypeEditComponent } from "./alarm-type-edit/alarm-type-edit.component";

@NgModule({
  declarations: [AlarmTypeEditComponent],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    MatCommonModule,
    MatListModule,
  ],
  exports: [AlarmTypeEditComponent],
})
export class AlarmModule {}
