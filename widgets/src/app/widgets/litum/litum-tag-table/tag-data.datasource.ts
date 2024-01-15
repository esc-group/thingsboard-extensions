import { MatTableDataSource } from "@angular/material/table";
import { BehaviorSubject } from "rxjs";
import { LitumService } from "../litum.service";
import { TagData } from "../models";
//import * as op from "rxjs/operators"

// https://blog.angular-university.io/angular-material-data-table/

export class TagDataDataSource extends MatTableDataSource<TagData> {
  private tagDataSubject = new BehaviorSubject<TagData[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private litumService: LitumService) {
    super();
  }

  connect(): BehaviorSubject<TagData[]> {
    console.log("TagDataDataSource.connect()");
    return this.tagDataSubject;
  }

  disconnect(): void {
    console.log("TagDataDataSource.disconnect()");
    this.tagDataSubject.complete();
    this.isLoadingSubject.complete();
  }

  loadTagData() {
    console.log("TagDataDataSource.loadTagData() started");
    this.isLoadingSubject.next(true);
    const tagDataItems: TagData[] = [];
    const subscription = this.litumService
      .getTagData()
      // .pipe(
      //   op.tap(tagDataItems.push),
      //   op.catchError(() => of([])),
      //   op.finalize(() => {
      //     this.tagDataSubject.next(tagDataItems)
      //     this.isLoadingSubject.next(false)
      //   })
      // )
      .subscribe({
        next: (tagData: TagData) => {
          tagDataItems.push(tagData);
        },
        complete: () => {
          this.tagDataSubject.next(tagDataItems);
          this.isLoadingSubject.next(false);
          subscription.unsubscribe();
          console.log(
            `loadTagData() completed ${tagDataItems.length} items`,
            tagDataItems
          );
        },
      });
  }
}
