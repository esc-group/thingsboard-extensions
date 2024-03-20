import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RemoteServerConfig } from '../models';

@Component({
  selector: 'ats-litum-config-edit',
  templateUrl: './litum-config-edit.component.html',
})
export class LitumConfigEditComponent implements OnInit {
  @Input() config: RemoteServerConfig;
  @Output() save = new EventEmitter<RemoteServerConfig>();

  form = new FormGroup({});

  ngOnInit(): void {
    console.log('type  of config.url is ' + typeof this.config.url);
    console.log('value of config.url is ' + this.config.url);
    this.form.addControl(
      'url',
      new FormControl<string>(this.config.url, [Validators.required, Validators.pattern(/.+/)])
    );
    this.form.addControl(
      'username',
      new FormControl<string>(this.config.username, [Validators.required, Validators.minLength(1)])
    );
    this.form.addControl(
      'password',
      new FormControl<string>(this.config.password, [Validators.required, Validators.minLength(1)])
    );
    this.form.addControl('verifySsl', new FormControl<boolean>(this.config.verifySsl, []));
  }

  onSubmit() {
    if (this.form.valid) this.save.next(this.form.value as RemoteServerConfig);
  }

  onReset() {
    this.form.setValue(this.config);
  }
}
