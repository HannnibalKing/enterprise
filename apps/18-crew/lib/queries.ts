import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getAstronauts() { return store.astronauts; }
export function getAstronautById(id: string) { return store.astronauts.find(a => a.id === id); }
export function getActiveAstronauts() { return store.astronauts.filter(a => a.status === 'Active'); }
export function getCurrentMissionCrew(mission: string) { return store.astronauts.filter(a => a.currentMission === mission); }
export function getTraining() { return store.training; }
export function getTrainingByAstronaut(astronautId: string) { return store.training.filter(t => t.astronautId === astronautId); }
export function getHealth() { return store.health; }
export function getHealthByAstronaut(astronautId: string) { return store.health.find(h => h.astronautId === astronautId); }
export function getStats() {
  return {
    totalAstronauts: store.astronauts.length,
    active: store.astronauts.filter(a => a.status === 'Active').length,
    inTraining: store.astronauts.filter(a => a.status === 'Training').length,
    inSpace: store.astronauts.filter(a => a.currentMission !== null).length,
    healthCautions: store.health.filter(h => h.status === 'caution').length,
  };
}
