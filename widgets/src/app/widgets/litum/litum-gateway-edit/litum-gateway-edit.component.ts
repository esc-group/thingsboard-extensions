import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalServerConfig } from '../models';

@Component({
  selector: 'ats-litum-gateway-edit',
  templateUrl: './litum-gateway-edit.component.html',
})
export class LitumGatewayEditComponent implements OnInit {
  @Input() config: LocalServerConfig;
  @Output() save = new EventEmitter<LocalServerConfig>();

  form = new FormGroup({});

  ngOnInit(): void {
    this.form.addControl(
      'host',
      new FormControl<string>(this.config.host, [Validators.required, Validators.pattern(/.+/)])
    );
    this.form.addControl(
      'port',
      new FormControl<number>(this.config.port, [Validators.required, Validators.min(1), Validators.max(65535)])
    );
  }

  onSubmit() {
    if (this.form.valid) this.save.next(this.form.value as LocalServerConfig);
  }

  onReset() {
    this.form.setValue(this.config);
  }
}
