export type UserRole = 'managing_partner'|'senior_associate'|'associate'|'paralegal'|'billing_manager';
export type CaseStatus = 'active'|'discovery'|'trial'|'settlement'|'closed'|'appeal';
export type CasePriority = 'critical'|'high'|'medium'|'low';
export type PracticeArea = 'corporate'|'litigation'|'ip'|'real_estate'|'employment'|'tax'|'mergers';
export type InvoiceStatus = 'draft'|'sent'|'paid'|'overdue'|'disputed';
export type EventType = 'hearing'|'deposition'|'filing_deadline'|'client_meeting'|'trial'|'mediation';

export interface LegalUser {
  id: string; name: string; email: string; role: UserRole; passwordHash: string;
}
export interface Client {
  id: string; name: string; type: 'corporate'|'individual'; industry: string;
  contactName: string; contactEmail: string; phone: string;
  ytdBilled: number; ytdCollected: number; activeCases: number; since: string; tier: 'platinum'|'gold'|'silver';
}
export interface Case {
  id: string; caseNumber: string; title: string; clientId: string; clientName: string;
  practiceArea: PracticeArea; status: CaseStatus; priority: CasePriority;
  leadAttorney: string; assignedTeam: string[];
  openDate: string; targetClose: string;
  billedHours: number; budgetedHours: number; billedAmount: number; budgetAmount: number;
  description: string; jurisdiction: string; opponent?: string;
}
export interface TimeEntry {
  id: string; caseId: string; caseName: string; attorney: string; date: string;
  hours: number; rate: number; amount: number; description: string; billed: boolean;
}
export interface Invoice {
  id: string; invoiceNumber: string; clientId: string; clientName: string;
  caseId: string; caseName: string;
  issueDate: string; dueDate: string; amount: number; paid: number;
  status: InvoiceStatus; items: number;
}
export interface CalendarEvent {
  id: string; title: string; type: EventType; caseId: string; caseName: string;
  date: string; time: string; duration: number; location: string; attorney: string;
}
export interface FirmMetrics {
  activeCases: number; totalClients: number; openInvoicesValue: number;
  overdueInvoicesValue: number; thisMonthBilled: number; thisMonthCollected: number;
  avgRealizationRate: number; totalUnbilledHours: number; upcomingDeadlines7d: number;
}
