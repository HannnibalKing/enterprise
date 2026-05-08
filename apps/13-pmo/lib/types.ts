export interface PmoUser {
  id: string; name: string; role: string; passwordHash: string; title: string;
}
export interface Project {
  id: string; code: string; name: string; sponsor: string;
  status: 'planning'|'active'|'on_hold'|'complete'|'cancelled';
  health: 'green'|'amber'|'red'; phase: string;
  startDate: string; endDate: string; completionPct: number;
  budget: number; spent: number; forecastAtCompletion: number;
  manager: string; programManager: string;
  teamSize: number; openRisks: number; openIssues: number;
  priorityScore: number;
}
export interface Resource {
  id: string; name: string; role: string; department: string;
  utilization: number; capacity: number; allocatedHours: number;
  availableHours: number; skillLevel: 'junior'|'mid'|'senior'|'principal';
  projectsActive: number; billableRate: number;
}
export interface Milestone {
  id: string; projectId: string; projectName: string; name: string;
  dueDate: string; completedDate: string | null;
  status: 'not_started'|'in_progress'|'complete'|'overdue'|'at_risk';
  owner: string; weight: number;
}
export interface PortfolioMetrics {
  totalProjects: number; activeProjects: number; completedThisYear: number;
  greenHealth: number; amberHealth: number; redHealth: number;
  totalBudget: number; totalSpent: number; budgetVariancePct: number;
  avgCompletionPct: number; resourceUtilization: number; openRisks: number;
}
