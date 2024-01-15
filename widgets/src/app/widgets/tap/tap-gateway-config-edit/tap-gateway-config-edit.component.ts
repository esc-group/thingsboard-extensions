import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { TapGateway } from "../models";

@Component({
  selector: "ats-tap-gateway-config-edit",
  templateUrl: "./tap-gateway-config-edit.component.html",
  styleUrls: ["./tap-gateway-config-edit.component.scss"],
})
export class TapGatewayConfigEditComponent implements OnInit {
  @Input() gateway: TapGateway;
  @Output() save: EventEmitter<TapGateway> = new EventEmitter();

  form = new FormGroup({});

  ngOnInit(): void {
    this.form.addControl(
      "deviceId",
      new FormControl<string>(this.gateway.deviceId)
    );
    this.form.addControl(
      "deviceName",
      new FormControl<string>(this.gateway.deviceName)
    );
    this.form.addControl(
      "host",
      new FormControl<string>(this.gateway.host, [
        Validators.required,
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "port",
      new FormControl<number>(this.gateway.port, [
        Validators.required,
        Validators.min(1),
        Validators.max(65535),
      ])
    );
    this.form.addControl(
      "heartbeatSeconds",
      new FormControl<number>(this.gateway.heartbeatSeconds, [
        Validators.required,
        Validators.min(5),
      ])
    );
    this.form.addControl(
      "heartbeatNumber",
      new FormControl<string>(this.gateway.heartbeatNumber, [
        Validators.minLength(1),
      ])
    );
    this.form.addControl(
      "heartbeatMessage",
      new FormControl<string>(this.gateway.heartbeatMessage, [
        Validators.minLength(1),
      ])
    );
  }

  onSubmit() {
    if (this.form.valid) {
      const gateway: TapGateway = this.form.value as TapGateway;
      this.save.next(gateway);
      this.gateway = gateway;
    }
  }

  onReset() {
    this.form.setValue(this.gateway);
  }
}
