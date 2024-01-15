import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IanaTimezones } from "../../shared/iana-timezones";
import { ServerConfig } from "../models";

@Component({
  selector: "ats-spectralink-server-edit",
  templateUrl: "./spectralink-server-edit.component.html",
})
export class SpectralinkServerEditComponent implements OnInit {
  @Input() config: ServerConfig;
  @Output() save = new EventEmitter<ServerConfig>();

  form = new FormGroup({});

  get timezones() {
    return IanaTimezones;
  }

  ngOnInit(): void {
    // the validation should be kept in-sync with:
    // https://github.com/esc-group/tb-gateways/blob/main/ats/gw/spectralink/models.py
    this.form.addControl(
      "bind",
      new FormControl<string>(this.config.bind, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "host",
      new FormControl<string>(this.config.host, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "port",
      new FormControl<number>(this.config.port, [
        Validators.required,
        Validators.min(1),
        Validators.max(65535),
      ])
    );
    this.form.addControl(
      "timezone",
      new FormControl<string>(this.config.timezone, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.next(this.form.value as ServerConfig);
      this.config = this.form.value as ServerConfig;
    }
  }

  onReset() {
    this.form.setValue(this.config);
  }
}
