import { store } from './store';
export function getUsers() { return store.users; }
export function getUserByName(name: string) { return store.users.find(u => u.name === name); }
export function getPayloads() { return store.payloads; }
export function getPayloadById(id: string) { return store.payloads.find(p => p.id === id); }
export function getPayloadsByStatus(status: string) { return store.payloads.filter(p => p.status === status); }
export function getManifests() { return store.manifests; }
export function getManifestById(id: string) { return store.manifests.find(m => m.id === id); }
export function getMilestones() { return store.milestones; }
export function getMilestonesByPayload(payloadId: string) { return store.milestones.filter(m => m.payloadId === payloadId); }
export function getStats() {
  return {
    totalPayloads: store.payloads.length,
    encapsulated: store.payloads.filter(p => p.status === 'encapsulated').length,
    integration: store.payloads.filter(p => p.status === 'integration').length,
    processing: store.payloads.filter(p => p.status === 'processing').length,
    delayed: store.milestones.filter(m => m.status === 'delayed').length,
    activeManifests: store.manifests.filter(m => m.status === 'confirmed').length,
  };
}
