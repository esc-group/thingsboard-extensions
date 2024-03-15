import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TapPager } from '../models';

@Component({
  selector: 'ats-tap-pager-view',
  templateUrl: './tap-pager-view.component.html',
  styleUrls: ['./tap-pager-view.component.scss'],
})
export class TapPagerViewComponent {
  @Input() pager: TapPager;
  @Output() delete: EventEmitter<TapPager> = new EventEmitter<TapPager>();

  onClick = () => {
    this.delete.next(this.pager);
  };
}
