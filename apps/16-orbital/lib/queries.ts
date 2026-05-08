import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getSpacecraft() { return store.spacecraft; }
export function getSpacecraftById(id: string) { return store.spacecraft.find(s => s.id === id); }
export function getOperationalSpacecraft() { return store.spacecraft.filter(s => s.status === 'operational'); }
export function getStations() { return store.stations; }
export function getStationById(id: string) { return store.stations.find(s => s.id === id); }
export function getContacts() { return store.contacts; }
export function getActiveContacts() { return store.contacts.filter(c => c.status === 'active'); }
export function getContactsBySpacecraft(spacecraftId: string) { return store.contacts.filter(c => c.spacecraftId === spacecraftId); }
export function getStats() {
  return {
    totalSpacecraft: store.spacecraft.length,
    operational: store.spacecraft.filter(s => s.status === 'operational').length,
    anomaly: store.spacecraft.filter(s => s.status === 'anomaly').length,
    activeContacts: store.contacts.filter(c => c.status === 'active').length,
    scheduledContacts: store.contacts.filter(c => c.status === 'scheduled').length,
  };
}
