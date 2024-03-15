import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '@shared/public-api';
import { SpectralinkEditComponent } from './spectralink-edit/spectralink-edit.component';
import { SpectralinkHandsetEditComponent } from './spectralink-handset-edit/spectralink-handset-edit.component';
import { SpectralinkServerEditComponent } from './spectralink-server-edit/spectralink-server-edit.component';
import { SpectralinkService } from './spectralink.service';
import { SpectralinkProgramComponent } from './spectralink-program/spectralink-program.component';

@NgModule({
  declarations: [
    SpectralinkEditComponent,
    SpectralinkServerEditComponent,
    SpectralinkHandsetEditComponent,
    SpectralinkProgramComponent,
  ],
  exports: [SpectralinkEditComponent, SpectralinkProgramComponent],
  providers: [SpectralinkService],
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
export class SpectralinkModule {}
