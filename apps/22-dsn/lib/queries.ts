import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getStations() { return store.stations; }
export function getStationById(id: string) { return store.stations.find(s => s.id === id); }
export function getAllAntennas() { return store.stations.flatMap(s => s.antennas); }
export function getAntennasByStation(stationId: string) { return store.stations.find(s => s.id === stationId)?.antennas ?? []; }
export function getContacts() { return store.contacts; }
export function getContactById(id: string) { return store.contacts.find(c => c.id === id); }
export function getActiveContacts() { return store.contacts.filter(c => c.status === 'active'); }
export function getLinks() { return store.links; }
export function getLinkByContact(contactId: string) { return store.links.find(l => l.contactId === contactId); }
export function getStats() {
  return {
    totalStations: store.stations.length,
    totalAntennas: store.stations.flatMap(s => s.antennas).length,
    activeContacts: store.contacts.filter(c => c.status === 'active').length,
    scheduledContacts: store.contacts.filter(c => c.status === 'scheduled').length,
    maintenance: store.stations.flatMap(s => s.antennas).filter(a => a.status === 'maintenance').length,
  };
}
