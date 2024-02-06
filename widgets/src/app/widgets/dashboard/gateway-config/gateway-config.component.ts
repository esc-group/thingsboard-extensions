import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { AppState } from "@core/core.state";
import { guid } from "@core/public-api";
import { WidgetContext } from "@home/models/widget-component.models";
import { Store } from "@ngrx/store";
import { Datasource, DatasourceData } from "@shared/models/widget.models";
import { DataKeyType, EntityType, PageComponent } from "@shared/public-api";
import { BehaviorSubject } from "rxjs";
import { JnlEditComponent } from "../../jnl/jnl-edit/jnl-edit.component";
import { LitumEditComponent } from "../../litum/litum-edit/litum-edit.component";
import { EscalationEditComponent } from "../../messenger/components/escalation-edit/escalation-edit.component";
import { RtxEditComponent } from "../../rtx/rtx-edit/rtx-edit.component";
import { SpectralinkEditComponent } from "../../spectralink/spectralink-edit/spectralink-edit.component";
import { TapEditComponent } from "../../tap/tap-edit/tap-edit.component";
import { ModalService } from "../modal";

const ConfigComponents = new Map<string, Type<any>>([
  // todo create CLIENT scope attribute for each gateway so we can query for the key value
  ["jnl", JnlEditComponent],
  ["litum", LitumEditComponent],
  ["messenger", EscalationEditComponent],
  ["rtx", RtxEditComponent],
  ["spectralink", SpectralinkEditComponent],
  ["tap", TapEditComponent],
]);

@Component({
  selector: "ats-gateway-config",
  templateUrl: "./gateway-config.component.html",
  styleUrls: ["./gateway-config.component.scss"],
})
export class GatewayConfigComponent extends PageComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ctx: WidgetContext;
  @ViewChild("container", { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild("title") titleDivRef: ElementRef<HTMLDivElement>;

  protected modalId = guid();
  protected component = null;
  protected title$ = new BehaviorSubject<string>("?"); // initial text ensures div height
  protected inactive$ = new BehaviorSubject<boolean>(true);

  static readonly DEFAULT_DATA_SOURCES: Array<Datasource> = [{ entityType: EntityType.DEVICE, name: "Sample Gateway" }];
  static readonly DEFAULT_DATA: Array<DatasourceData> = [
    {
      dataKey: { name: "active", type: DataKeyType.attribute },
      datasource: null,
      data: [[0, "false"]],
    },
    {
      dataKey: { name: "configComponentType", type: DataKeyType.attribute },
      datasource: null,
      data: [[0, "rtx"]],
    },
  ];

  constructor(protected store: Store<AppState>, protected modalService: ModalService) {
    super(store);
  }

  ngAfterViewInit(): void {
    let dataSources = this.ctx.datasources;
    let data = this.ctx.data;
    if (this.ctx.datasources.length < 1 || this.ctx.data.length < 2) {
      console.error("DEVICE with 'active' and 'configComponentType' attributes required; using sample data");
      dataSources = GatewayConfigComponent.DEFAULT_DATA_SOURCES;
      data = GatewayConfigComponent.DEFAULT_DATA;
    } else if (data[0].dataKey.name !== "active" || data[1].dataKey.name !== "configComponentType") {
      throw new Error("'active' then 'configComponentType' attributes required");
    }
    this.title$.next(dataSources[0].name);
    this.component = ConfigComponents.get(data[1].data[0][1]);
    if (this.component === undefined) throw new Error("'configComponentType' value is invalid / unsupported");
    this.inactive$.next(data[0].data[0][1] === "false");
  }

  ngOnInit(): void {
    /*
     This assignment is required for us to access this widget in the ThingsBoard JavaScript code's
     onDataUpdated function.

     Set widget type to 'Latest values'.

     ```resources
     static/widgets/thingsboard-extension-widgets.js [x] Is module
     ```

     ```css
     [None / Empty / Blank]
     ```

     ```html
     <ats-gateway-config [ctx]="ctx"></ats-gateway-config>
     ```

     ```js
     self.onDataUpdated = function() { self.ctx.$scope.gatewayConfigWidget.onDataUpdated() }
     ```
    */
    this.ctx.$scope.gatewayConfigWidget = this;
  }

  ngOnDestroy(): void {}

  openDialog(): void {
    const injector = Injector.create({
      providers: [
        { provide: "widgetContext", useValue: this.ctx },
        { provide: "gatewayName", useValue: this.title$.value },
      ],
    });
    this.container.createComponent(this.component, { injector });
    this.modalService.open(this.modalId);
  }

  closeDialog(): void {
    this.container.remove(0);
    this.modalService.close(this.modalId);
  }

  onDataUpdated(): void {
    if (this.ctx?.data?.length == 2) {
      this.inactive$.next(this.ctx.data[0].data[0][1] === "false");
      this.ctx.detectContainerChanges();
    }
  }
}
