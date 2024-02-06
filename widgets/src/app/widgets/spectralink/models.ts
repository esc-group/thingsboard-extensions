export interface ServerConfig {
  bind: string;
  host: string;
  port: number;
  timezone: string;
}

export interface HandsetConfig {
  username: string;
  password: string;
}

export interface ProgramHandsetRpc {
  ipAddress: string;
  extension: number;
  username: string;
  password: string;
}
