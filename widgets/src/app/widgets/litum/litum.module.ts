import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCommonModule, MatOptionModule } from "@angular/material/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { SharedModule } from "@shared/public-api";
import { AlarmModule } from "../alarm/alarm.module";
import { LitumEditComponent } from "./litum-edit/litum-edit.component";
import { LitumService } from "./litum.service";
import { LitumTriggersEditComponent } from "./litum-triggers-edit/litum-triggers-edit.component";
import { LitumGatewayEditComponent } from "./litum-gateway-edit/litum-gateway-edit.component";
import { LitumConfigEditComponent } from "./litum-config-edit/litum-config-edit.component";
import { LitumTagTableComponent } from "./litum-tag-table/litum-tag-table.component";

@NgModule({
  declarations: [
    LitumEditComponent,
    LitumTriggersEditComponent,
    LitumGatewayEditComponent,
    LitumConfigEditComponent,
    LitumTagTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    MatCommonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatListModule,
    MatExpansionModule,
    MatInputModule,
    ReactiveFormsModule,
    AlarmModule,
  ],
  exports: [LitumEditComponent, LitumTagTableComponent],
  providers: [LitumService],
})
export class LitumModule {}
