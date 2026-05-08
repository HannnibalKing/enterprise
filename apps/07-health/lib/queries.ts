import { store } from './store';
import type { DepartmentName } from './types';

export function getDashboardData() {
  const unack = store.alerts.filter(a=>!a.acknowledged);
  const last30snap = store.snapshots.slice(-30);
  return { metrics:store.metrics, alerts:unack, last30snap, departments:[...store.departments.values()] };
}

export function getPatients(dept?: DepartmentName, status?: string) {
  let list = [...store.patients];
  if (dept)   list = list.filter(p=>p.department===dept);
  if (status) list = list.filter(p=>p.status===status);
  list.sort((a,b)=>{
    const ord: Record<string,number>={critical:0,serious:1,stable:2,discharge_ready:3,discharged:4};
    return (ord[a.status]??5)-(ord[b.status]??5);
  });
  return list;
}

export function getDepartments() { return [...store.departments.values()]; }
export function getERQueue() { return [...store.erQueue].sort((a,b)=>a.triage-b.triage); }
export function getAlerts() { return [...store.alerts].sort((a,b)=>b.timestamp.localeCompare(a.timestamp)); }
export function getCensusData() { return { snapshots:store.snapshots, metrics:store.metrics }; }
