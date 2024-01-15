import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HandsetConfig } from "../models";

@Component({
  selector: "ats-spectralink-handset-edit",
  templateUrl: "./spectralink-handset-edit.component.html",
})
export class SpectralinkHandsetEditComponent implements OnInit {
  @Input() config: HandsetConfig;
  @Output() save = new EventEmitter<HandsetConfig>();

  form = new FormGroup({});

  ngOnInit(): void {
    // the validation should be kept in-sync with:
    // https://github.com/esc-group/tb-gateways/blob/main/ats/gw/rtx/models.py
    this.form.addControl(
      "username",
      new FormControl<string>(this.config.username, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "password",
      new FormControl<string>(this.config.password, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.next(this.form.value as HandsetConfig);
      this.config = this.form.value as HandsetConfig;
    }
  }

  onReset() {
    this.form.setValue(this.config);
  }
}
