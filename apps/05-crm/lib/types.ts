export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'demo';
export type UserRole = 'admin' | 'manager' | 'rep';
export type ContactStatus = 'active' | 'prospect' | 'inactive';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: UserRole;
  quota: number;
  title: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: CompanySize;
  annualRevenue: number;
  location: string;
  ownerId: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  ownerId: string;
  status: ContactStatus;
  lastContactedAt: string;
  createdAt: string;
  tags: string[];
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  ownerId: string;
  contactId: string;
  companyId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  body: string;
  dealId?: string;
  contactId?: string;
  companyId?: string;
  userId: string;
  completedAt?: string;
  createdAt: string;
}

export interface AuthPayload { userId: string; }

// ── Enriched / computed types ──────────────────────────────────────────────

export interface DealWithRelations extends Deal {
  contact: { id: string; firstName: string; lastName: string; email: string };
  company: { id: string; name: string; industry: string };
  owner: { id: string; name: string; avatar: string };
  daysInStage: number;
}

export interface ContactWithRelations extends Contact {
  company: { id: string; name: string };
  owner: { id: string; name: string; avatar: string };
  dealCount: number;
  activeDealCount: number;
}

export interface CompanyWithStats extends Company {
  contactCount: number;
  openDealCount: number;
  totalPipelineValue: number;
  owner: { id: string; name: string; avatar: string };
}

export interface ActivityWithRelations extends Activity {
  user: { id: string; name: string; avatar: string };
  deal?: { id: string; title: string };
  contact?: { id: string; firstName: string; lastName: string };
  company?: { id: string; name: string };
}

export interface DashboardData {
  pipelineValue: number;
  weightedPipelineValue: number;
  wonThisMonth: number;
  winRate: number;
  dealsInPipeline: number;
  avgDealSize: number;
  monthlyRevenue: { month: string; label: string; actual: number; quota: number }[];
  recentActivities: ActivityWithRelations[];
  topDeals: DealWithRelations[];
  stageBreakdown: { stage: DealStage; label: string; count: number; value: number; color: string }[];
}

export interface PipelineColumn {
  stage: DealStage;
  label: string;
  color: string;
  deals: DealWithRelations[];
  totalValue: number;
  weightedValue: number;
  probability: number;
}

export interface AnalyticsData {
  monthlyRevenue: { month: string; label: string; actual: number; quota: number }[];
  winRateByRep: { id: string; name: string; avatar: string; won: number; lost: number; rate: number; wonValue: number }[];
  activityBreakdown: { type: ActivityType; label: string; count: number; color: string }[];
  dealsByStage: { stage: string; label: string; value: number; count: number; color: string }[];
  teamQuota: number;
  teamActual: number;
}
