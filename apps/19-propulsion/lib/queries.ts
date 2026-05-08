import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getEngines() { return store.engines; }
export function getEngineById(id: string) { return store.engines.find(e => e.id === id); }
export function getOperationalEngines() { return store.engines.filter(e => e.status === 'operational'); }
export function getTestRuns() { return store.testRuns; }
export function getTestRunsByEngine(engineId: string) { return store.testRuns.filter(t => t.engineId === engineId); }
export function getPassedTests() { return store.testRuns.filter(t => t.result === 'pass'); }
export function getComponents() { return store.components; }
export function getComponentsByEngine(engineId: string) { return store.components.filter(c => c.engineId === engineId); }
export function getStats() {
  return {
    totalEngines: store.engines.length,
    operational: store.engines.filter(e => e.status === 'operational').length,
    testing: store.engines.filter(e => e.status === 'testing').length,
    totalTests: store.testRuns.length,
    passedTests: store.testRuns.filter(t => t.result === 'pass').length,
    failedTests: store.testRuns.filter(t => t.result === 'fail').length,
  };
}
