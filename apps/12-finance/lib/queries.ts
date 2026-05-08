import { store } from './store';
import type { FinanceMetrics } from './types';

export function getDashboardData() {
  const { accounts, invoices, employees, budgetLines, pnl } = store;
  const totalAssets = accounts.filter(a=>a.category==='asset').reduce((s,a)=>s+Math.abs(a.balance),0);
  const totalLiabilities = accounts.filter(a=>a.category==='liability').reduce((s,a)=>s+Math.abs(a.balance),0);
  const netEquity = totalAssets - totalLiabilities;
  const ytdRevenue = accounts.filter(a=>a.category==='revenue').reduce((s,a)=>s+a.ytdActivity,0);
  const ytdExpenses = accounts.filter(a=>a.category==='expense').reduce((s,a)=>s+a.ytdActivity,0);
  const cogs = accounts.find(a=>a.accountNo==='5010')?.ytdActivity ?? 0;
  const ytdNetIncome = ytdRevenue - ytdExpenses;
  const netMarginPct = ytdRevenue > 0 ? Math.round((ytdNetIncome/ytdRevenue)*1000)/10 : 0;
  const pendingPayables = invoices.filter(i=>['pending','approved'].includes(i.status)).reduce((s,i)=>s+i.amount-i.paidAmount,0);
  const overduePayables = invoices.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.amount-i.paidAmount,0);
  const totalPayroll = employees.reduce((s,e)=>s+e.ytdGross,0);
  const budgetUtilPct = Math.round(budgetLines.reduce((s,b)=>s+b.ytdActual,0)/budgetLines.reduce((s,b)=>s+b.annualBudget*0.75,0)*100);
  const metrics: FinanceMetrics = {
    totalAssets, totalLiabilities, netEquity,
    ytdRevenue, ytdNetIncome, netMarginPct,
    pendingPayables, overduePayables,
    totalPayroll, budgetUtilPct,
  };
  const ytdCogs = cogs;
  return { metrics, pnl: pnl.filter(p=>p.revenue>0), accounts, ytdCogs };
}

export function getLedger() { return store.accounts; }
export function getInvoices() { return store.invoices.sort((a,b)=>b.dueDate.localeCompare(a.dueDate)); }
export function getPayroll() { return { runs: store.payrollRuns, employees: store.employees }; }
export function getBudget() { return store.budgetLines; }
