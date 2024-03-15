import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modals: ModalComponent[] = [];

  add(modal: ModalComponent) {
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter((modal) => modal.id !== id);
  }

  open(id: string) {
    this.modals.find((modal) => modal.id === id).open();
  }

  close(id: string) {
    this.modals.find((x) => x.id === id).close();
  }
}
