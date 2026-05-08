import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getLaunches() { return store.launches; }
export function getLaunchById(id: string) { return store.launches.find(l => l.id === id); }
export function getUpcomingLaunches() { return store.launches.filter(l => l.status === 'upcoming'); }
export function getVehicles() { return store.vehicles; }
export function getVehicleById(id: string) { return store.vehicles.find(v => v.id === id); }
export function getCountdowns() { return store.countdowns; }
export function getCountdownByLaunch(launchId: string) { return store.countdowns.find(c => c.launchId === launchId); }
export function getStats() {
  return {
    totalLaunches: store.launches.length,
    upcomingLaunches: store.launches.filter(l => l.status === 'upcoming').length,
    successLaunches: store.launches.filter(l => l.status === 'success').length,
    holdLaunches: store.launches.filter(l => l.status === 'hold').length,
    totalVehicles: store.vehicles.length,
    operationalVehicles: store.vehicles.filter(v => v.status === 'nominal').length,
  };
}
