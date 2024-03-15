import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IanaTimezones } from '../../shared/iana-timezones';
import { RtxConfig } from '../models';

@Component({
  selector: 'ats-rtx-rtx-edit',
  templateUrl: './rtx-rtx-edit.component.html',
})
export class RtxRtxEditComponent implements OnInit {
  @Input() config: RtxConfig;
  @Output() save = new EventEmitter<RtxConfig>();

  form = new FormGroup({});

  get timezones() {
    return IanaTimezones;
  }

  ngOnInit(): void {
    // the validation should be kept in-sync with:
    // https://github.com/esc-group/tb-gateways/blob/main/ats/gw/rtx/models.py
    this.form.addControl(
      'host',
      new FormControl<string>(this.config.host, [Validators.required, Validators.minLength(1)])
    );
    this.form.addControl(
      'port',
      new FormControl<number>(this.config.port, [Validators.required, Validators.min(1), Validators.max(65535)])
    );
    this.form.addControl(
      'pbxRefreshSeconds',
      new FormControl<number>(this.config.pbxRefreshSeconds, [
        Validators.required,
        Validators.min(0),
        Validators.max(30),
      ])
    );
    this.form.addControl(
      'rtxHandsetResponseTimeout',
      new FormControl<number>(this.config.rtxHandsetResponseTimeout, [
        Validators.required,
        Validators.min(0),
        Validators.max(120),
      ])
    );
    this.form.addControl(
      'rtxUserResponseTimeout',
      new FormControl<number>(this.config.rtxUserResponseTimeout, [
        Validators.required,
        Validators.min(30),
        Validators.max(3600),
      ])
    );
    this.form.addControl(
      'timezone',
      new FormControl<string>(this.config.timezone, [Validators.required, Validators.minLength(1)])
    );
  }

  onSubmit() {
    if (this.form.valid) {
      const config: RtxConfig = this.form.value as RtxConfig;
      this.save.next(config);
      this.config = config;
    }
  }

  onReset() {
    this.form.setValue(this.config);
  }
}
