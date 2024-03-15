import { Component, EventEmitter, Output } from '@angular/core';

export interface AddPagerData {
  pagerName: string;
  pagerNumber: string;
}

@Component({
  selector: 'ats-tap-pager-add',
  templateUrl: './tap-pager-add.component.html',
  styleUrls: ['./tap-pager-add.component.scss'],
})
export class TapPagerAddComponent {
  @Output() add = new EventEmitter<AddPagerData>();

  onClick = (pagerName: string, pagerNumber: string) => {
    this.add.next({ pagerName, pagerNumber } as AddPagerData);
  };
}
