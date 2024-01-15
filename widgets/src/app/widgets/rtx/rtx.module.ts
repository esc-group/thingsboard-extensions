import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCommonModule, MatOptionModule } from "@angular/material/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { SharedModule } from "@shared/public-api";
import { RtxEditComponent } from "./rtx-edit/rtx-edit.component";
import { RtxRtxEditComponent } from "./rtx-rtx-edit/rtx-rtx-edit.component";
import { RtxService } from "./rtx.service";

@NgModule({
  declarations: [RtxEditComponent, RtxRtxEditComponent],
  exports: [RtxEditComponent],
  providers: [RtxService],
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    MatCommonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatExpansionModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class RtxModule {}
