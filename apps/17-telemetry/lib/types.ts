export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Stream {
  id: string; spacecraft: string; station: string; dataRateMbps: number;
  status: 'active'|'idle'|'loss'; startTime: string; protocol: string;
}
export interface Channel {
  id: string; streamId: string; name: string; value: number; unit: string;
  minLimit: number; maxLimit: number; status: 'nominal'|'caution'|'warning'|'critical';
}
export interface Alert {
  id: string; streamId: string; channelId: string; timestamp: string;
  severity: 'info'|'warning'|'critical'; message: string; acknowledged: boolean;
}
export interface Store {
  users: SpaceUser[];
  streams: Stream[];
  channels: Channel[];
  alerts: Alert[];
}
