import { store } from './store';
import type { FirmMetrics } from './types';
export function getCases()          { return store.cases; }
export function getClients()        { return store.clients; }
export function getInvoices()       { return store.invoices; }
export function getCalendarEvents() { return store.calendarEvents; }
export function getDashboardData() {
  const { cases, invoices, calendarEvents } = store;
  const activeCases = cases.filter(c=>c.status!=='closed').length;
  const openInv = invoices.filter(i=>i.status==='sent'||i.status==='overdue');
  const overdueInv = invoices.filter(i=>i.status==='overdue');
  const paidInv = invoices.filter(i=>i.status==='paid');
  const totalBilled = invoices.reduce((s,i)=>s+i.amount,0);
  const totalPaid = paidInv.reduce((s,i)=>s+i.paid,0);
  const unbilledHours = cases.reduce((s,c)=>s+(c.budgetedHours-c.billedHours),0);
  const upcoming7d = calendarEvents.filter(e=>e.date>='2026-05-07'&&e.date<='2026-05-14').length;
  const metrics: FirmMetrics = {
    activeCases, totalClients: store.clients.length,
    openInvoicesValue: openInv.reduce((s,i)=>s+i.amount,0),
    overdueInvoicesValue: overdueInv.reduce((s,i)=>s+i.amount,0),
    thisMonthBilled: totalBilled,
    thisMonthCollected: totalPaid,
    avgRealizationRate: Math.round((totalPaid/totalBilled)*1000)/10,
    totalUnbilledHours: unbilledHours,
    upcomingDeadlines7d: upcoming7d,
  };
  const urgentCases = cases.filter(c=>c.priority==='critical'||c.priority==='high').slice(0,6);
  const upcomingEvents = calendarEvents.filter(e=>e.date>='2026-05-07').slice(0,8);
  return { metrics, urgentCases, upcomingEvents };
}
