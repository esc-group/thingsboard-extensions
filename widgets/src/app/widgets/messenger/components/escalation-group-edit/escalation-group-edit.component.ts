import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  SubEntity,
  UiEscalationGroup,
  UiEscalationLevel,
} from "../../store/state";
import { MatSelectionListChange } from "@angular/material/list";
import { FormControl, Validators } from "@angular/forms";
import * as op from "rxjs/operators";
import * as EscalationActions from "../../store/actions";
import { Store } from "@ngrx/store";
import { AppState } from "@core/core.state";
import { Subscription } from "rxjs";

@Component({
  selector: "ats-escalation-group-edit",
  templateUrl: "./escalation-group-edit.component.html",
  styleUrls: ["./escalation-group-edit.component.scss"],
})
export class EscalationGroupEditComponent
  implements OnChanges, OnInit, OnDestroy
{
  @Input() usedByLevels: UiEscalationLevel[];
  @Input() group?: UiEscalationGroup;
  @Input() devices: SubEntity[];

  protected subscriptions: Subscription[] = [];

  fcName = new FormControl(this.group?.name, [
    Validators.required,
    Validators.minLength(1),
  ]);

  @Output() nameChanged = this.fcName.valueChanges.pipe(
    op.debounceTime(750),
    op.filter(() => this.fcName.valid && this.fcName.value !== this.group?.name)
  );

  @Output() deviceAdded = new EventEmitter<SubEntity>();
  @Output() deviceRemoved = new EventEmitter<SubEntity>();

  constructor(protected store: Store<AppState>) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log("EGE ngOnChanges", changes);
    if (changes.hasOwnProperty("group")) {
      // console.log('ngOnChanges() group', changes.group.currentValue)
      this.fcName.setValue(changes.group.currentValue?.name);
    }
  }

  selectionChange(event: MatSelectionListChange) {
    event.options.forEach((option) => {
      if (option.selected) {
        // console.log(`Adding "${option.value.name}" device as member`)
        this.deviceAdded.emit(option.value);
      } else {
        // console.log(`Removing ${option.value.name} device as member`)
        this.deviceRemoved.emit(option.value);
      }
    });
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.fcName.valueChanges
        .pipe(op.debounceTime(750))
        .subscribe(this.setGroupName)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setGroupName = (name: string): void => {
    if (this.fcName.valid) {
      console.log("group name is now " + name);
      this.store.dispatch(EscalationActions.setGroupName({ name }));
    }
  };
}
