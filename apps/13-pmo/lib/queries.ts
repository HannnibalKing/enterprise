import { store } from './store';
import type { PortfolioMetrics } from './types';

export function getDashboardData() {
  const { projects, resources, milestones } = store;
  const active = projects.filter(p=>p.status==='active');
  const completed = projects.filter(p=>p.status==='complete');
  const totalBudget = projects.reduce((s,p)=>s+p.budget,0);
  const totalSpent = projects.reduce((s,p)=>s+p.spent,0);
  const avgCompletion = Math.round(active.reduce((s,p)=>s+p.completionPct,0)/Math.max(1,active.length));
  const resourceUtil = Math.round(resources.reduce((s,r)=>s+r.utilization,0)/resources.length);
  const metrics: PortfolioMetrics = {
    totalProjects: projects.length,
    activeProjects: active.length,
    completedThisYear: completed.length,
    greenHealth: active.filter(p=>p.health==='green').length,
    amberHealth: active.filter(p=>p.health==='amber').length,
    redHealth: active.filter(p=>p.health==='red').length,
    totalBudget, totalSpent,
    budgetVariancePct: Math.round(((totalSpent-totalBudget*0.75)/totalBudget*0.75)*1000)/10,
    avgCompletionPct: avgCompletion,
    resourceUtilization: resourceUtil,
    openRisks: projects.reduce((s,p)=>s+p.openRisks,0),
  };
  const upcoming = milestones.filter(m=>m.status!=='complete'&&m.dueDate>='2026-05-07').sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,8);
  return { metrics, topProjects: active.sort((a,b)=>b.priorityScore-a.priorityScore).slice(0,8), upcoming };
}

export function getProjects() { return store.projects.sort((a,b)=>b.priorityScore-a.priorityScore); }
export function getResources() { return store.resources.sort((a,b)=>b.utilization-a.utilization); }
export function getMilestones() { return store.milestones.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)); }
export function getReports() {
  const { projects, resources, milestones } = store;
  return { projects, resources, milestones };
}
