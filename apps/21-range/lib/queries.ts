import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getHazards() { return store.hazards; }
export function getHazardById(id: string) { return store.hazards.find(h => h.id === id); }
export function getActiveHazards() { return store.hazards.filter(h => h.status === 'active'); }
export function getClearances() { return store.clearances; }
export function getClearanceById(id: string) { return store.clearances.find(c => c.id === id); }
export function getPendingClearances() { return store.clearances.filter(c => c.status === 'pending'); }
export function getWeather() { return store.weather; }
export function getTodayWeather() { return store.weather[0]; }
export function getLaunchGoWeather() { return store.weather.filter(w => w.launchGo); }
export function getIncidents() { return store.incidents; }
export function getOpenIncidents() { return store.incidents.filter(i => i.status === 'open'); }
export function getStats() {
  return {
    activeHazards: store.hazards.filter(h => h.status === 'active').length,
    pendingClearances: store.clearances.filter(c => c.status === 'pending').length,
    grantedClearances: store.clearances.filter(c => c.status === 'granted').length,
    launchGoWindow: store.weather.filter(w => w.launchGo).length,
    openIncidents: store.incidents.filter(i => i.status === 'open').length,
  };
}
