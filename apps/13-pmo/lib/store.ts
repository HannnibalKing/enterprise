import bcrypt from 'bcryptjs';
import type { PmoUser, Project, Resource, Milestone } from './types';

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

interface Store { users: PmoUser[]; projects: Project[]; resources: Resource[]; milestones: Milestone[]; }

function initStore(): Store {
  const r = lcg(20260515);
  const pw = bcrypt.hashSync('pmo123', 10);

  const users: PmoUser[] = [
    {id:'u1',name:'xavier', role:'pmo_director',   title:'PMO Director',       passwordHash:pw},
    {id:'u2',name:'diana',  role:'program_manager', title:'Program Manager',    passwordHash:pw},
    {id:'u3',name:'sam',    role:'project_manager', title:'Project Manager',    passwordHash:pw},
    {id:'u4',name:'tara',   role:'resource_planner',title:'Resource Planner',   passwordHash:pw},
    {id:'u5',name:'otto',   role:'pmo_analyst',     title:'PMO Analyst',        passwordHash:pw},
  ];

  const projectData: Array<Omit<Project,'id'|'spent'|'forecastAtCompletion'>> = [
    {code:'PRJ-0001',name:'Enterprise CRM Migration',       sponsor:'CEO',         status:'active',    health:'green',  phase:'Execution',   startDate:'2025-09-01',endDate:'2026-08-31',completionPct:62,budget:2_400_000,manager:'diana',   programManager:'diana', teamSize:12,openRisks:2,openIssues:1,priorityScore:95},
    {code:'PRJ-0002',name:'Data Warehouse Modernization',   sponsor:'CTO',         status:'active',    health:'amber',  phase:'Execution',   startDate:'2025-11-01',endDate:'2026-09-30',completionPct:44,budget:3_100_000,manager:'sam',     programManager:'diana', teamSize:9,openRisks:4,openIssues:3,priorityScore:90},
    {code:'PRJ-0003',name:'Global ERP Rollout',             sponsor:'CFO',         status:'active',    health:'red',    phase:'Planning',    startDate:'2026-01-15',endDate:'2027-03-31',completionPct:18,budget:7_800_000,manager:'diana',   programManager:'diana', teamSize:22,openRisks:7,openIssues:5,priorityScore:98},
    {code:'PRJ-0004',name:'Customer Portal v3',             sponsor:'CMO',         status:'active',    health:'green',  phase:'Execution',   startDate:'2026-02-01',endDate:'2026-07-31',completionPct:71,budget:980_000,  manager:'sam',     programManager:'diana', teamSize:6,openRisks:1,openIssues:0,priorityScore:80},
    {code:'PRJ-0005',name:'Cloud Infrastructure Migration', sponsor:'CTO',         status:'active',    health:'amber',  phase:'Execution',   startDate:'2025-10-01',endDate:'2026-06-30',completionPct:88,budget:1_600_000,manager:'diana',   programManager:'diana', teamSize:8,openRisks:3,openIssues:2,priorityScore:85},
    {code:'PRJ-0006',name:'HR Self-Service Platform',       sponsor:'CHRO',        status:'active',    health:'green',  phase:'UAT',         startDate:'2026-01-01',endDate:'2026-06-15',completionPct:82,budget:750_000,  manager:'sam',     programManager:'diana', teamSize:5,openRisks:1,openIssues:1,priorityScore:70},
    {code:'PRJ-0007',name:'Supply Chain Analytics',         sponsor:'COO',         status:'planning',  health:'green',  phase:'Initiation',  startDate:'2026-06-01',endDate:'2026-12-31',completionPct:5, budget:1_200_000,manager:'sam',     programManager:'diana', teamSize:7,openRisks:2,openIssues:0,priorityScore:75},
    {code:'PRJ-0008',name:'Cybersecurity Framework v2',     sponsor:'CISO',        status:'active',    health:'green',  phase:'Execution',   startDate:'2026-03-01',endDate:'2026-09-30',completionPct:35,budget:2_100_000,manager:'diana',   programManager:'diana', teamSize:10,openRisks:2,openIssues:1,priorityScore:92},
    {code:'PRJ-0009',name:'Mobile App Relaunch',            sponsor:'CPO',         status:'active',    health:'amber',  phase:'Development', startDate:'2026-01-01',endDate:'2026-08-31',completionPct:53,budget:1_450_000,manager:'sam',     programManager:'diana', teamSize:8,openRisks:3,openIssues:2,priorityScore:82},
    {code:'PRJ-0010',name:'BI Dashboard Suite',             sponsor:'CFO',         status:'complete',  health:'green',  phase:'Closed',      startDate:'2025-06-01',endDate:'2026-03-31',completionPct:100,budget:620_000, manager:'diana',   programManager:'diana', teamSize:4,openRisks:0,openIssues:0,priorityScore:65},
    {code:'PRJ-0011',name:'API Gateway Consolidation',      sponsor:'CTO',         status:'active',    health:'green',  phase:'Testing',     startDate:'2026-02-15',endDate:'2026-07-15',completionPct:68,budget:880_000,  manager:'sam',     programManager:'diana', teamSize:5,openRisks:1,openIssues:1,priorityScore:77},
    {code:'PRJ-0012',name:'Customer Data Platform',         sponsor:'CMO',         status:'planning',  health:'amber',  phase:'Scoping',     startDate:'2026-07-01',endDate:'2027-02-28',completionPct:8, budget:2_900_000,manager:'diana',   programManager:'diana', teamSize:11,openRisks:4,openIssues:2,priorityScore:88},
    {code:'PRJ-0013',name:'Logistics Optimization AI',      sponsor:'COO',         status:'on_hold',   health:'amber',  phase:'On Hold',     startDate:'2026-04-01',endDate:'2026-12-31',completionPct:22,budget:1_750_000,manager:'sam',     programManager:'diana', teamSize:0,openRisks:3,openIssues:4,priorityScore:60},
    {code:'PRJ-0014',name:'Regulatory Compliance Suite',    sponsor:'CLO',         status:'active',    health:'red',    phase:'Execution',   startDate:'2025-12-01',endDate:'2026-07-31',completionPct:58,budget:1_300_000,manager:'diana',   programManager:'diana', teamSize:7,openRisks:6,openIssues:4,priorityScore:94},
    {code:'PRJ-0015',name:'Employee Training LMS',          sponsor:'CHRO',        status:'complete',  health:'green',  phase:'Closed',      startDate:'2025-08-01',endDate:'2026-02-28',completionPct:100,budget:480_000, manager:'sam',     programManager:'diana', teamSize:3,openRisks:0,openIssues:0,priorityScore:55},
    {code:'PRJ-0016',name:'Partner Ecosystem Portal',       sponsor:'CEO',         status:'planning',  health:'green',  phase:'Initiation',  startDate:'2026-08-01',endDate:'2027-04-30',completionPct:3, budget:2_200_000,manager:'diana',   programManager:'diana', teamSize:0,openRisks:1,openIssues:0,priorityScore:72},
  ];

  const projects: Project[] = projectData.map((p,i)=>{
    const spent = p.status==='complete' ? p.budget*0.97 : Math.round(p.budget*(p.completionPct/100)*(0.95+r()*0.15));
    const fac = p.status==='complete' ? spent : Math.round(p.budget*(0.95+r()*0.18));
    return {...p, id:`proj${String(i+1).padStart(2,'0')}`, spent, forecastAtCompletion: fac};
  });

  const resourceNames = ['Lena Zhao','Marcus Ray','Sophie Huber','Tariq Hassan','Yuki Brooks','Carlos Vega','Naomi Ellis','Finn O\'Brien','Priya Nair','Mei-Ling Wu','Dayo Okafor','Ivan Korol'];
  const roles = ['Frontend Dev','Backend Dev','DevOps','Data Engineer','BA/Analyst','QA Engineer','Scrum Master','Architect'];
  const depts = ['Engineering','Data','Platform','QA','PMO','Architecture'];
  const skills: Resource['skillLevel'][] = ['senior','principal','mid','senior','mid','senior','senior','principal','senior','mid','mid','senior'];

  const resources: Resource[] = resourceNames.map((name,i)=>{
    const capacity = 40;
    const util = Math.round((0.65+r()*0.35)*100);
    const allocatedHours = Math.round(capacity*util/100);
    return {
      id:`res${String(i+1).padStart(2,'0')}`,
      name, role:roles[i%roles.length], department:depts[i%depts.length],
      utilization:util, capacity, allocatedHours, availableHours:capacity-allocatedHours,
      skillLevel:skills[i], projectsActive:1+Math.floor(r()*3),
      billableRate:Math.round((120+r()*130)*10)/10,
    };
  });

  const milestoneNames = [
    'Requirements Signed Off','Architecture Approved','Dev Phase 1 Complete','QA Signoff','UAT Complete','Go-Live','Post-Launch Review',
    'Vendor Selection','Security Audit Pass','Steering Committee Approval','Data Migration Complete','Integration Testing Done',
  ];
  const owners = ['diana','sam','xavier','tara'];
  const milestones: Milestone[] = projects.slice(0,10).flatMap((proj,pi)=>{
    return Array.from({length:3},(_,mi)=>{
      const baseDate = new Date(proj.startDate);
      const offset = Math.floor((mi+1)/4*(new Date(proj.endDate).getTime()-baseDate.getTime())/1000/86400);
      const due = new Date(baseDate); due.setDate(due.getDate()+offset);
      const dueStr = due.toISOString().slice(0,10);
      const isPast = dueStr < '2026-05-07';
      const isComplete = isPast && r() > 0.25;
      const isOverdue = isPast && !isComplete;
      const status: Milestone['status'] = proj.status==='complete'?'complete':isComplete?'complete':isOverdue?'overdue':r()>0.8?'at_risk':'in_progress';
      return {
        id:`ms${String(pi*3+mi+1).padStart(3,'0')}`,
        projectId:proj.id, projectName:proj.name,
        name:milestoneNames[(pi*3+mi)%milestoneNames.length],
        dueDate:dueStr, completedDate:isComplete?dueStr:null,
        status, owner:owners[(pi+mi)%owners.length], weight:Math.round(10+r()*25),
      };
    });
  });

  return {users, projects, resources, milestones};
}

const g = globalThis as typeof globalThis & { __vantageStore?: Store };
export const store = g.__vantageStore ?? (g.__vantageStore = initStore());
