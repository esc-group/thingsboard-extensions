import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ModalComponent } from './modal.component';

/**
 * Original Source is below:
 * - Article: https://jasonwatmore.com/post/2020/09/24/angular-10-custom-modal-window-dialog-box
 * - Repo: https://github.com/cornflourblue/angular-10-custom-modal
 * - YouTube: https://www.youtube.com/watch?v=w061hMOBibI
 */

@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  declarations: [ModalComponent],
  exports: [ModalComponent],
})
export class ModalModule {}
