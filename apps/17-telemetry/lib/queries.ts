import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getStreams() { return store.streams; }
export function getStreamById(id: string) { return store.streams.find(s => s.id === id); }
export function getActiveStreams() { return store.streams.filter(s => s.status === 'active'); }
export function getChannels() { return store.channels; }
export function getChannelsByStream(streamId: string) { return store.channels.filter(c => c.streamId === streamId); }
export function getNominalChannels() { return store.channels.filter(c => c.status === 'nominal'); }
export function getAlerts() { return store.alerts; }
export function getUnacknowledgedAlerts() { return store.alerts.filter(a => !a.acknowledged); }
export function getStats() {
  return {
    totalStreams: store.streams.length,
    activeStreams: store.streams.filter(s => s.status === 'active').length,
    lossStreams: store.streams.filter(s => s.status === 'loss').length,
    criticalChannels: store.channels.filter(c => c.status === 'critical').length,
    warningChannels: store.channels.filter(c => c.status === 'warning').length,
    unackedAlerts: store.alerts.filter(a => !a.acknowledged).length,
  };
}
