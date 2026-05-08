export interface FinUser {
  id: string; name: string; role: string; passwordHash: string; title: string;
}
export interface GLAccount {
  id: string; accountNo: string; accountName: string;
  category: 'asset'|'liability'|'equity'|'revenue'|'expense';
  normalBalance: 'debit'|'credit'; balance: number; ytdActivity: number;
}
export interface APInvoice {
  id: string; invoiceNo: string; vendor: string; invoiceDate: string; dueDate: string;
  amount: number; paidAmount: number; status: 'pending'|'approved'|'paid'|'overdue'|'disputed';
  category: string; paymentTerms: string; daysOverdue: number;
}
export interface PayrollRun {
  id: string; period: string; payDate: string; totalGross: number; totalNet: number;
  totalTax: number; totalBenefits: number; headcount: number; status: 'draft'|'approved'|'paid';
}
export interface Employee {
  id: string; name: string; department: string; title: string;
  salary: number; ytdGross: number; ytdTax: number; ytdBenefits: number;
}
export interface BudgetLine {
  id: string; department: string; category: string;
  q1Budget: number; q1Actual: number; q2Budget: number; q2Actual: number;
  q3Budget: number; q3Actual: number; q4Budget: number; q4Forecast: number;
  annualBudget: number; ytdActual: number; ytdVariance: number;
}
export interface PnLSnapshot {
  month: string; revenue: number; cogs: number; grossProfit: number;
  opex: number; ebit: number; netIncome: number; ebitMargin: number;
}
export interface FinanceMetrics {
  totalAssets: number; totalLiabilities: number; netEquity: number;
  ytdRevenue: number; ytdNetIncome: number; netMarginPct: number;
  pendingPayables: number; overduePayables: number;
  totalPayroll: number; budgetUtilPct: number;
}
