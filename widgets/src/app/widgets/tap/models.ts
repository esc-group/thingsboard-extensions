export interface TapDevice {
  deviceId: string;
  deviceName: string;
}

export interface TapServerConfig {
  host: string;
  port: number;
  heartbeatSeconds: number;
  heartbeatNumber: string;
  heartbeatMessage: string;
}

export interface TapGateway extends TapDevice, TapServerConfig {}

export interface TapPager extends TapDevice {
  pagerNumber: string;
  gatewayId: string;
}
