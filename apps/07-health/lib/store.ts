import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { StaffUser, Department, Patient, ERQueueEntry, HospitalAlert, CensusSnapshot, HospitalMetrics, DepartmentName } from './types';

function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=Math.imul(1664525,s)+1013904223>>>0; return s/0x100000000; }; }

interface Store {
  users:       Map<string, StaffUser>;
  departments: Map<string, Department>;
  patients:    Patient[];
  erQueue:     ERQueueEntry[];
  alerts:      HospitalAlert[];
  snapshots:   CensusSnapshot[];
  metrics:     HospitalMetrics;
}

function initStore(): Store {
  const PW = bcrypt.hashSync('health123', 10);

  const users = new Map<string, StaffUser>([
    ['u1',{id:'u1',name:'Dr. Catherine Moore',    email:'catherine@meridianhealth.com',avatar:'CM',role:'chief_medical_officer',title:'Chief Medical Officer',    department:'General Medicine', passwordHash:PW}],
    ['u2',{id:'u2',name:'Dr. Rafael Santos',      email:'rafael@meridianhealth.com',   avatar:'RS',role:'department_head',      title:'Head of Emergency Medicine',department:'Emergency',       passwordHash:PW}],
    ['u3',{id:'u3',name:'Dr. Priya Nair',         email:'priya@meridianhealth.com',    avatar:'PN',role:'attending_physician',  title:'Chief of Cardiology',       department:'Cardiology',      passwordHash:PW}],
    ['u4',{id:'u4',name:'Jessica Warren RN',      email:'jessica@meridianhealth.com',  avatar:'JW',role:'nurse_manager',        title:'Director of Nursing',       department:'ICU',             passwordHash:PW}],
    ['u5',{id:'u5',name:'Dr. Thomas Yuen',        email:'thomas@meridianhealth.com',   avatar:'TY',role:'specialist',           title:'Chief of Surgery',          department:'Surgery',         passwordHash:PW}],
  ]);

  const DEPT_DATA: [DepartmentName,number,string,number,number,number,string,string,number,number,number,string,string][] = [
    ['Emergency',       1,'East', 32, 28, 3, 'Dr. Rafael Santos',   'N. Johnson RN',  186, 0.3, 2.1, '#ef4444','🚨'],
    ['ICU',             2,'West',  24, 22, 1, 'Dr. Sandra Kim',     'Jessica Warren', 22,  4.6, 8.3, '#f97316','🏥'],
    ['Surgery',         3,'North', 18, 14, 2, 'Dr. Thomas Yuen',    'K. Clarke RN',   12,  2.1, 3.4, '#a855f7','⚕️'],
    ['Cardiology',      4,'South', 36, 30, 2, 'Dr. Priya Nair',     'M. Flores RN',   34,  3.8, 4.2, '#3b82f6','❤️'],
    ['Oncology',        5,'West',  28, 25, 1, 'Dr. Aaron Wells',    'T. Gibson RN',   25,  6.2, 6.8, '#8b5cf6','🧬'],
    ['Pediatrics',      6,'North', 40, 28, 4, 'Dr. Elena Vasquez',  'R. Thomas RN',   62,  2.4, 1.2, '#10b981','👶'],
    ['Radiology',       7,'East',  12,  8, 1, 'Dr. Omar Hassan',    'P. White RN',    94,  0.1, 0.8, '#6366f1','📡'],
    ['General Medicine',8,'South', 60, 48, 6, 'Dr. Catherine Moore','L. Davis RN',    78,  3.2, 3.6, '#14b8a6','🩺'],
  ];

  const departments = new Map<string, Department>();
  for (const [name,floor,wing,total,occupied,maint,head,nm,pToday,los,readmit,color,icon] of DEPT_DATA) {
    const id = name.toLowerCase().replace(/ /g,'_');
    departments.set(id,{id,name,floor,wing,totalBeds:total,occupiedBeds:occupied,availableBeds:total-occupied-maint,maintenanceBeds:maint,headPhysician:head,nurseManager:nm,patientsToday:pToday,avgLOS:los,readmissionRate:readmit,patientSatisfaction:+(88+Math.random()*10).toFixed(1),color,icon});
  }

  const FIRST=['James','Maria','Robert','Linda','Michael','Susan','William','Nancy','David','Karen','Richard','Betty','Charles','Helen','Joseph','Sandra','Thomas','Donna','Christopher','Carol','Daniel','Ruth','Paul','Sharon','Mark'];
  const LAST =['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Lewis','Lee','Robinson','Walker','Hall','Allen','Young'];
  const DX_MAP: Partial<Record<DepartmentName,string[]>> = {
    Emergency:       ['Chest pain','Abdominal pain','Laceration','Fracture R wrist','Anaphylaxis','Head trauma','Stroke alert','Sepsis workup'],
    ICU:             ['Respiratory failure','Septic shock','ARDS','Post-op monitoring','Diabetic ketoacidosis','Acute liver failure'],
    Surgery:         ['Post-op appendectomy','Post-op colectomy','Post-op CABG','Post-op knee replacement','Hernia repair recovery'],
    Cardiology:      ['STEMI','NSTEMI','Heart failure exacerbation','Afib with RVR','Hypertensive urgency','Valve disease workup'],
    Oncology:        ['Chemo cycle 3','Lymphoma staging','Post-chemo neutropenia','Palliative care','Targeted therapy monitoring'],
    Pediatrics:      ['RSV bronchiolitis','Febrile seizure','Asthma exacerbation','Dehydration','Appendicitis workup','Croup'],
    Radiology:       ['CT staging','MRI brain','PET scan','Fluoroscopy'],
    'General Medicine':['Pneumonia','UTI','COPD exacerbation','Hypertensive crisis','Cellulitis','DVT workup'],
  };
  const INS=['BlueCross PPO','Aetna HMO','Medicare Part A','Medicaid','United Health','Cigna PPO','Self-pay','Humana'];
  const rng = lcg(777);
  const patients: Patient[] = [];
  const deptNames = [...departments.values()].map(d=>d.name);
  let idx=0;
  for (const dept of departments.values()) {
    const dxList = DX_MAP[dept.name] ?? ['General observation'];
    for (let i=0;i<dept.occupiedBeds;i++) {
      const fn=FIRST[idx%FIRST.length]; const ln=LAST[Math.floor(rng()*LAST.length)];
      const age=18+Math.floor(rng()*72);
      const status=(rng()<0.08)?'critical':rng()<0.18?'serious':rng()<0.6?'stable':'discharge_ready';
      const admitDaysAgo=Math.floor(rng()*dept.avgLOS*1.5)+1;
      const admitDate=new Date(Date.now()-admitDaysAgo*86400000).toISOString().slice(0,10);
      const dx=dxList[Math.floor(rng()*dxList.length)];
      const alerts:string[]=[];
      if(status==='critical')alerts.push('Critical vitals','Physician notified');
      if(rng()<0.15)alerts.push('Fall risk');
      if(rng()<0.1)alerts.push('Allergy: Penicillin');
      const hr=60+Math.floor(rng()*80);
      patients.push({
        id:`p${(++idx).toString().padStart(3,'0')}`,mrn:`MRN${(idx+10000)}`,
        name:`${fn} ${ln}`,age,gender:rng()<0.5?'M':'F',
        department:dept.name,room:`${dept.floor}${dept.wing[0]}${(100+Math.floor(rng()*50)).toString().slice(1)}`,
        bed:`${Math.floor(rng()*4)+1}`,status,admitDate,diagnosis:dx,
        physician:dept.headPhysician,insurance:INS[Math.floor(rng()*INS.length)],alerts,
        vitals:{hr,bp:`${110+Math.floor(rng()*50)}/${70+Math.floor(rng()*30)}`,temp:+(97.5+rng()*3).toFixed(1),spo2:Math.floor(88+rng()*12),rr:12+Math.floor(rng()*10)},
      });
    }
  }

  const CHIEF=['Chest pain','Shortness of breath','Abdominal pain','Headache','Fever','Lacerations','Back pain','Dizziness','Nausea/vomiting','Syncope','Palpitations'];
  const erQueue: ERQueueEntry[] = [];
  const rng2=lcg(888);
  for(let i=0;i<14;i++){
    const fn=FIRST[Math.floor(rng2()*FIRST.length)]; const ln=LAST[Math.floor(rng2()*LAST.length)];
    const triage=(rng2()<0.1?1:rng2()<0.25?2:rng2()<0.55?3:rng2()<0.8?4:5) as 1|2|3|4|5;
    const waitMinutes=triage===1?5:triage===2?10+Math.floor(rng2()*20):30+Math.floor(rng2()*90);
    const status:(ERQueueEntry['status'])[]=(['waiting','in_triage','in_treatment','boarding']);
    erQueue.push({id:`er${i+1}`,name:`${fn} ${ln}`,age:18+Math.floor(rng2()*72),chief:CHIEF[Math.floor(rng2()*CHIEF.length)],triage,arrivalTime:new Date(Date.now()-(waitMinutes+Math.floor(rng2()*30))*60000).toISOString(),waitMinutes,status:status[Math.floor(rng2()*4)]});
  }

  const alerts: HospitalAlert[] = [
    {id:'a1',severity:'critical',type:'patient',    title:'Septic Shock - ICU Bed 2B',message:'Patient Robert Wilson (MRN10042) showing signs of septic shock. Vasopressors initiated. ICU attending paged.',department:'ICU',timestamp:new Date(Date.now()-12*60000).toISOString(),acknowledged:false},
    {id:'a2',severity:'critical',type:'capacity',   title:'ED at 87.5% Capacity',message:'Emergency Department approaching critical capacity. 28/32 beds occupied. Diversion protocols may be needed within 2 hours.',department:'Emergency',timestamp:new Date(Date.now()-28*60000).toISOString(),acknowledged:false},
    {id:'a3',severity:'urgent',  type:'patient',    title:'Acute MI - Cath Lab Activated',message:'STEMI alert: Patient in Cardiology requires urgent catheterization. Cath lab team notified, 20-minute door-to-balloon target.',department:'Cardiology',timestamp:new Date(Date.now()-45*60000).toISOString(),acknowledged:true},
    {id:'a4',severity:'urgent',  type:'staffing',   title:'ICU Nurse Shortage — Night Shift',message:'Two ICU nurses called out for night shift. Ratio currently 1:3.5, exceeding safe limits. Agency staff requested.',department:'ICU',timestamp:new Date(Date.now()-90*60000).toISOString(),acknowledged:false},
    {id:'a5',severity:'warning', type:'equipment',  title:'MRI Scanner Maintenance Required',message:'MRI unit 2 in Radiology requires calibration. Scheduling 4-hour maintenance window. Redirecting to MRI unit 1.',department:'Radiology',timestamp:new Date(Date.now()-3*3600000).toISOString(),acknowledged:true},
    {id:'a6',severity:'warning', type:'medication', title:'Controlled Substance Count Discrepancy',message:'Morphine count discrepancy of 2 units in Surgery department. Pharmacy and compliance notified.',department:'Surgery',timestamp:new Date(Date.now()-5*3600000).toISOString(),acknowledged:false},
    {id:'a7',severity:'info',    type:'system',     title:'EMR System Maintenance — 02:00 Sun',message:'Electronic Medical Records system scheduled for maintenance Sunday 2:00–4:00 AM. Downtime procedures will be in effect.',timestamp:new Date(Date.now()-8*3600000).toISOString(),acknowledged:true},
    {id:'a8',severity:'info',    type:'capacity',   title:'Discharge Wave — 14 Patients Ready',message:'14 patients across 5 departments cleared for discharge. Transport and care coordination teams notified.',timestamp:new Date(Date.now()-2*3600000).toISOString(),acknowledged:false},
  ];

  const rng3=lcg(999);
  const snapshots: CensusSnapshot[] = [];
  for(let i=89;i>=0;i--){
    const date=new Date(Date.now()-i*86400000).toISOString().slice(0,10);
    const totalCensus=220+Math.floor(rng3()*80);
    const occupancyPct=+((totalCensus/250)*100).toFixed(1);
    snapshots.push({date,totalCensus,erVisits:60+Math.floor(rng3()*60),admissions:20+Math.floor(rng3()*25),discharges:18+Math.floor(rng3()*25),occupancyPct});
  }

  const totalBeds=250; const occupiedBeds=203; 
  const metrics: HospitalMetrics = {
    totalBeds,occupiedBeds,occupancyPct:+((occupiedBeds/totalBeds)*100).toFixed(1),
    availableBeds:totalBeds-occupiedBeds,erQueueLength:erQueue.length,
    erAvgWaitMinutes:Math.round(erQueue.reduce((s,e)=>s+e.waitMinutes,0)/erQueue.length),
    criticalPatients:patients.filter(p=>p.status==='critical').length,
    plannedDischarges:patients.filter(p=>p.status==='discharge_ready').length,
    staffOnDuty:148,pendingOrders:37,todayAdmissions:23,todayDischarges:19,
  };

  return { users, departments, patients, erQueue, alerts, snapshots, metrics };
}

const g = globalThis as typeof globalThis & { __health?: Store };
export const store = g.__health ?? (g.__health = initStore());
