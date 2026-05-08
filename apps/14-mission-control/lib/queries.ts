import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getMissions() { return store.missions; }
export function getMissionById(id: string) { return store.missions.find(m => m.id === id); }
export function getActiveMissions() { return store.missions.filter(m => m.status === 'active'); }
export function getTelemetry() { return store.telemetry; }
export function getTelemetryByMission(missionId: string) { return store.telemetry.filter(t => t.missionId === missionId); }
export function getAnomalies() { return store.anomalies; }
export function getOpenAnomalies() { return store.anomalies.filter(a => a.status !== 'resolved'); }
export function getAnomaliesBySeverity(severity: string) { return store.anomalies.filter(a => a.severity === severity); }
export function getStats() {
  return {
    totalMissions: store.missions.length,
    activeMissions: store.missions.filter(m => m.status === 'active').length,
    openAnomalies: store.anomalies.filter(a => a.status !== 'resolved').length,
    criticalAnomalies: store.anomalies.filter(a => a.severity === 'critical').length,
    telemetryWarnings: store.telemetry.filter(t => t.status !== 'nominal').length,
  };
}
