import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { QuantumConfig } from "../models";

@Component({
  selector: "ats-jnl-quantum-edit",
  templateUrl: "./jnl-quantum-edit.component.html",
  styleUrls: ["./jnl-quantum-edit.component.scss"],
})
export class JnlQuantumEditComponent implements OnInit {
  @Input() config: QuantumConfig;
  @Output() save = new EventEmitter<QuantumConfig>();
  form = new FormGroup({});

  ngOnInit(): void {
    this.form.addControl(
      "ipAddress",
      new FormControl<string>(this.config.ipAddress, [
        Validators.required,
        Validators.pattern(/.+/),
      ])
    );
    this.form.addControl(
      "username",
      new FormControl<string>(this.config.username, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "password",
      new FormControl<string>(this.config.username, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "useRoom",
      new FormControl<boolean>(this.config.useRoom, [Validators.required])
    );
  }

  onSubmit() {
    if (this.form.valid) this.save.next(this.form.value as QuantumConfig);
  }

  onReset() {
    this.form.setValue(this.config);
  }
}
