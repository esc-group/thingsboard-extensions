import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCommonModule } from "@angular/material/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/public-api";
import { AlarmModule } from "../alarm/alarm.module";
import { MessengerService } from "./messenger.service";
import {
  EscalationEditComponent,
  EscalationGroupEditComponent,
  EscalationLevelEditComponent,
} from "./public-api";
import { featureKey, reducer } from "./store";

@NgModule({
  declarations: [
    EscalationEditComponent,
    EscalationGroupEditComponent,
    EscalationLevelEditComponent,
  ],
  imports: [
    // WARNING: importing either BrowserModule or BrowserAnimationsModule will break <mat-tab-group>
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    MatCommonModule,
    MatListModule,
    MatTabsModule,
    MatSelectModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    AlarmModule,
    StoreModule.forFeature(featureKey, reducer),
  ],
  exports: [EscalationEditComponent],
  providers: [MessengerService],
})
export class MessengerModule {}
