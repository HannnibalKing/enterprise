import bcrypt from 'bcryptjs';
import type { FinUser, GLAccount, APInvoice, PayrollRun, Employee, BudgetLine, PnLSnapshot } from './types';

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

interface Store {
  users: FinUser[];
  accounts: GLAccount[];
  invoices: APInvoice[];
  payrollRuns: PayrollRun[];
  employees: Employee[];
  budgetLines: BudgetLine[];
  pnl: PnLSnapshot[];
}

function initStore(): Store {
  const r = lcg(20260101);
  const pw = bcrypt.hashSync('finance123', 10);

  const users: FinUser[] = [
    {id:'u1',name:'eleanor',role:'cfo',          title:'Chief Financial Officer', passwordHash:pw},
    {id:'u2',name:'thomas', role:'controller',   title:'Controller',              passwordHash:pw},
    {id:'u3',name:'amara',  role:'ap_specialist',title:'AP Specialist',           passwordHash:pw},
    {id:'u4',name:'jin',    role:'payroll_manager',title:'Payroll Manager',       passwordHash:pw},
    {id:'u5',name:'nova',   role:'budget_analyst',title:'Budget Analyst',         passwordHash:pw},
  ];

  const accounts: GLAccount[] = [
    {id:'a1', accountNo:'1010',name:'Cash & Cash Equivalents',category:'asset',      normalBalance:'debit',  balance:8_450_000,  ytdActivity: 3_200_000},
    {id:'a2', accountNo:'1110',name:'Accounts Receivable',     category:'asset',      normalBalance:'debit',  balance:12_380_000, ytdActivity: 18_900_000},
    {id:'a3', accountNo:'1200',name:'Inventory',               category:'asset',      normalBalance:'debit',  balance:6_750_000,  ytdActivity: 4_100_000},
    {id:'a4', accountNo:'1400',name:'Prepaid Expenses',        category:'asset',      normalBalance:'debit',  balance:980_000,    ytdActivity: 520_000},
    {id:'a5', accountNo:'1500',name:'Property & Equipment',    category:'asset',      normalBalance:'debit',  balance:42_100_000, ytdActivity: 2_800_000},
    {id:'a6', accountNo:'1510',name:'Accumulated Depreciation',category:'asset',      normalBalance:'credit', balance:-14_300_000,ytdActivity:-1_400_000},
    {id:'a7', accountNo:'2010',name:'Accounts Payable',        category:'liability',  normalBalance:'credit', balance:5_620_000,  ytdActivity: 11_200_000},
    {id:'a8', accountNo:'2100',name:'Accrued Liabilities',     category:'liability',  normalBalance:'credit', balance:2_190_000,  ytdActivity: 8_400_000},
    {id:'a9', accountNo:'2300',name:'Long-Term Debt',          category:'liability',  normalBalance:'credit', balance:18_500_000, ytdActivity:-2_000_000},
    {id:'a10',accountNo:'2400',name:'Deferred Revenue',        category:'liability',  normalBalance:'credit', balance:1_450_000,  ytdActivity:-350_000},
    {id:'a11',accountNo:'3010',name:'Common Stock',            category:'equity',     normalBalance:'credit', balance:10_000_000, ytdActivity:0},
    {id:'a12',accountNo:'3020',name:'Retained Earnings',       category:'equity',     normalBalance:'credit', balance:18_600_000, ytdActivity: 5_800_000},
    {id:'a13',accountNo:'4010',name:'Product Revenue',         category:'revenue',    normalBalance:'credit', balance:47_800_000, ytdActivity:47_800_000},
    {id:'a14',accountNo:'4020',name:'Service Revenue',         category:'revenue',    normalBalance:'credit', balance:9_200_000,  ytdActivity: 9_200_000},
    {id:'a15',accountNo:'5010',name:'Cost of Goods Sold',      category:'expense',    normalBalance:'debit',  balance:28_600_000, ytdActivity:28_600_000},
    {id:'a16',accountNo:'6010',name:'Salaries & Wages',        category:'expense',    normalBalance:'debit',  balance:9_800_000,  ytdActivity: 9_800_000},
    {id:'a17',accountNo:'6020',name:'R&D Expense',             category:'expense',    normalBalance:'debit',  balance:4_200_000,  ytdActivity: 4_200_000},
    {id:'a18',accountNo:'6030',name:'Marketing & Sales',       category:'expense',    normalBalance:'debit',  balance:3_100_000,  ytdActivity: 3_100_000},
    {id:'a19',accountNo:'6040',name:'G&A Expense',             category:'expense',    normalBalance:'debit',  balance:2_650_000,  ytdActivity: 2_650_000},
    {id:'a20',accountNo:'7010',name:'Depreciation & Amort.',   category:'expense',    normalBalance:'debit',  balance:1_400_000,  ytdActivity: 1_400_000},
  ].map(a=>({...a, id:a.id, accountName:a.name} as unknown as GLAccount));

  const vendors = ['Apex Supplies Co.','Meridian Components','Stellar Tech Inc.','Orbit Materials','Nova Services LLC','Titan Logistics','Crest Analytics','Harbor Industrial'];
  const catList = ['Software','Hardware','Professional Services','Raw Materials','Logistics','Facilities','IT Services','Consulting'];
  const invoices: APInvoice[] = Array.from({length:25},(_,i)=>{
    const vendor = vendors[Math.floor(r()*vendors.length)];
    const cat = catList[Math.floor(r()*catList.length)];
    const amount = Math.round((r()*480000+8000)*100)/100;
    const days = Math.floor(r()*150);
    const invoiceDate = new Date(2026,0,1); invoiceDate.setDate(invoiceDate.getDate()-days);
    const dueDate = new Date(invoiceDate); dueDate.setDate(dueDate.getDate()+30);
    const now = new Date('2026-05-07');
    const overdue = Math.max(0,Math.floor((now.getTime()-dueDate.getTime())/(1000*86400)));
    const statuses: APInvoice['status'][] = ['pending','approved','paid','overdue','disputed'];
    const status: APInvoice['status'] = days>120?'paid':overdue>0?'overdue':statuses[Math.floor(r()*3)];
    const paidAmount = status==='paid'?amount:status==='overdue'&&r()>0.5?Math.round(amount*0.4*100)/100:0;
    return {
      id:`inv${String(i+1).padStart(3,'0')}`,
      invoiceNo:`INV-2026-${String(i+1001).padStart(4,'0')}`,
      vendor, category:cat, amount, paidAmount,
      invoiceDate: invoiceDate.toISOString().slice(0,10),
      dueDate: dueDate.toISOString().slice(0,10),
      status, paymentTerms:'Net 30', daysOverdue:overdue,
    };
  });

  const depts = ['Engineering','Sales','Operations','HR','Finance','Marketing'];
  const employees: Employee[] = [
    {id:'e1',name:'Marcus Chen',       department:'Engineering', title:'Sr. Engineer',        salary:145000,ytdGross:58000,ytdTax:16240,ytdBenefits:4350},
    {id:'e2',name:'Priya Sharma',      department:'Engineering', title:'Principal Engineer',  salary:165000,ytdGross:66000,ytdTax:18480,ytdBenefits:4950},
    {id:'e3',name:'Jordan Williams',   department:'Sales',       title:'Account Executive',   salary:95000, ytdGross:38000,ytdTax:10640,ytdBenefits:2850},
    {id:'e4',name:'Aaliyah Carter',    department:'Sales',       title:'Sales Director',      salary:180000,ytdGross:72000,ytdTax:20160,ytdBenefits:5400},
    {id:'e5',name:'Thomas Wright',     department:'Operations',  title:'Operations Manager',  salary:125000,ytdGross:50000,ytdTax:14000,ytdBenefits:3750},
    {id:'e6',name:'Sofia Martinez',    department:'HR',          title:'HR Business Partner', salary:110000,ytdGross:44000,ytdTax:12320,ytdBenefits:3300},
    {id:'e7',name:'Kai Nakamura',      department:'Finance',     title:'Financial Analyst',   salary:130000,ytdGross:52000,ytdTax:14560,ytdBenefits:3900},
    {id:'e8',name:'Amara Osei',        department:'Marketing',   title:'Marketing Manager',   salary:120000,ytdGross:48000,ytdTax:13440,ytdBenefits:3600},
    {id:'e9',name:'Derek Washington',  department:'Engineering', title:'DevOps Lead',         salary:155000,ytdGross:62000,ytdTax:17360,ytdBenefits:4650},
    {id:'e10',name:'Nadia Petrov',     department:'Operations',  title:'Supply Chain Analyst',salary:105000,ytdGross:42000,ytdTax:11760,ytdBenefits:3150},
    {id:'e11',name:'Elijah Thompson',  department:'Sales',       title:'SDR Manager',         salary:98000, ytdGross:39200,ytdTax:10976,ytdBenefits:2940},
    {id:'e12',name:'Yuki Tanaka',      department:'Engineering', title:'QA Lead',             salary:135000,ytdGross:54000,ytdTax:15120,ytdBenefits:4050},
    {id:'e13',name:'Zara Ahmed',       department:'Marketing',   title:'Content Strategist',  salary:100000,ytdGross:40000,ytdTax:11200,ytdBenefits:3000},
    {id:'e14',name:'Remy Dumont',      department:'Finance',     title:'Controller',          salary:160000,ytdGross:64000,ytdTax:17920,ytdBenefits:4800},
    {id:'e15',name:'Camille Foster',   department:'HR',          title:'Recruiter',           salary:88000, ytdGross:35200,ytdTax:9856,ytdBenefits:2640},
  ];

  const payrollRuns: PayrollRun[] = [
    {id:'pr1',period:'Q2-2026 May',  payDate:'2026-05-31',totalGross:695200,totalNet:486640,totalTax:194656,totalBenefits:52140,headcount:15,status:'draft'},
    {id:'pr2',period:'Q2-2026 Apr',  payDate:'2026-04-30',totalGross:695200,totalNet:486640,totalTax:194656,totalBenefits:52140,headcount:15,status:'approved'},
    {id:'pr3',period:'Q1-2026 Mar',  payDate:'2026-03-31',totalGross:695200,totalNet:486640,totalTax:194656,totalBenefits:52140,headcount:15,status:'paid'},
    {id:'pr4',period:'Q1-2026 Feb',  payDate:'2026-02-28',totalGross:682000,totalNet:477400,totalTax:190960,totalBenefits:51150,headcount:14,status:'paid'},
    {id:'pr5',period:'Q1-2026 Jan',  payDate:'2026-01-31',totalGross:682000,totalNet:477400,totalTax:190960,totalBenefits:51150,headcount:14,status:'paid'},
  ];

  const budgetLines: BudgetLine[] = depts.map((dept,i)=>{
    const base = [3800000,2200000,4100000,1100000,1600000,2400000][i];
    return {
      id:`bl${i+1}`, department:dept,
      category:'Operating Expense',
      q1Budget:base*0.25, q1Actual:Math.round(base*0.25*(0.88+r()*0.2)*100)/100,
      q2Budget:base*0.25, q2Actual:Math.round(base*0.25*(0.88+r()*0.2)*100)/100,
      q3Budget:base*0.25, q3Actual:Math.round(base*0.25*(0.88+r()*0.2)*100)/100,
      q4Budget:base*0.25, q4Forecast:Math.round(base*0.25*(0.88+r()*0.2)*100)/100,
      annualBudget:base,
      ytdActual:Math.round(base*0.75*(0.90+r()*0.15)*100)/100,
      ytdVariance:0,
    };
  }).map(b=>({...b, ytdVariance:Math.round((b.annualBudget*0.75-b.ytdActual)*100)/100}));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const pnl: PnLSnapshot[] = months.map((m,i)=>{
    const rev = i<5 ? Math.round((4200000+r()*600000)*100)/100 : 0;
    const cogs = Math.round(rev*0.50*100)/100;
    const gp = rev-cogs;
    const opex = Math.round(rev*0.30*100)/100;
    const ebit = gp-opex;
    const net = Math.round(ebit*0.78*100)/100;
    const ebitMargin = rev>0 ? Math.round((ebit/rev)*1000)/10 : 0;
    return {month:m, revenue:rev, cogs, grossProfit:gp, opex, ebit, netIncome:net, ebitMargin};
  });

  return {users, accounts: accounts as unknown as GLAccount[], invoices, payrollRuns, employees, budgetLines, pnl};
}

const g = globalThis as typeof globalThis & { __luminaryStore?: Store };
export const store = g.__luminaryStore ?? (g.__luminaryStore = initStore());
