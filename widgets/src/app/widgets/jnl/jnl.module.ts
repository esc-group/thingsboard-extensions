import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCommonModule } from "@angular/material/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SharedModule } from "@shared/public-api";
import { JnlEditComponent } from "./jnl-edit/jnl-edit.component";
import { JnlQuantumEditComponent } from "./jnl-quantum-edit/jnl-quantum-edit.component";
import { JnlAlarmsEditComponent } from "./jnl-alarms-edit/jnl-alarms-edit.component";
import { JnlService } from "./jnl-service";

@NgModule({
  declarations: [
    JnlEditComponent,
    JnlQuantumEditComponent,
    JnlAlarmsEditComponent,
  ],
  exports: [JnlEditComponent],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    MatCommonModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ],
  providers: [JnlService],
})
export class JnlModule {}
