import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LitumService } from '../litum.service';
import { TagDataDataSource } from './tag-data.datasource';

// https://blog.angular-university.io/angular-material-data-table/

@Component({
  selector: 'ats-litum-tag-table',
  templateUrl: './litum-tag-table.component.html',
  styleUrls: ['./litum-tag-table.component.scss'],
})
export class LitumTagTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['tagCode', 'personName', 'zoneName'];
  dataSource = new TagDataDataSource(this.litumService);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private litumService: LitumService) {}

  ngOnInit(): void {
    this.dataSource.loadTagData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onSearchValueChanged(event: any) {
    this.dataSource.filter = event.target.value;
  }
}
