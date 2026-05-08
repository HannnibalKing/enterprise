import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('crew123', 10);
  const users = [
    { id:'u1', name:'armstrong', role:'crew_commander', passwordHash: pw },
    { id:'u2', name:'aldrin', role:'mission_specialist', passwordHash: pw },
    { id:'u3', name:'collins', role:'pilot', passwordHash: pw },
    { id:'u4', name:'shepard', role:'flight_surgeon', passwordHash: pw },
    { id:'u5', name:'ride', role:'crew_ops', passwordHash: pw },
  ];
  const rng = lcg(18001);
  const astronauts = [
    { id:'a1', name:'Neil Armstrong', agency:'NASA', status:'Active', currentMission:'Artemis VII', flightHours:8762, evaHours:12.5, specializations:['Commander','Geology'], bloodType:'A+' },
    { id:'a2', name:'Valentina Tereshkova', agency:'Roscosmos', status:'Active', currentMission:'ISS-71', flightHours:5430, evaHours:8.2, specializations:['Pilot','EVA'], bloodType:'O-' },
    { id:'a3', name:'Mae Jemison', agency:'NASA', status:'Active', currentMission:null, flightHours:3210, evaHours:6.1, specializations:['Science','Medicine'], bloodType:'B+' },
    { id:'a4', name:'Yuri Malenchenko', agency:'Roscosmos', status:'Active', currentMission:'ISS-71', flightHours:9200, evaHours:21.4, specializations:['Commander','EVA','Robotics'], bloodType:'AB+' },
    { id:'a5', name:'Chris Hadfield', agency:'CSA', status:'Training', currentMission:null, flightHours:4570, evaHours:14.7, specializations:['Music','Photography','EVA'], bloodType:'A-' },
    { id:'a6', name:'Peggy Whitson', agency:'NASA', status:'Active', currentMission:'Artemis VII', flightHours:11000, evaHours:60.2, specializations:['Biology','EVA','Commander'], bloodType:'O+' },
    { id:'a7', name:'Akihiko Hoshide', agency:'JAXA', status:'Active', currentMission:null, flightHours:4080, evaHours:12.8, specializations:['Engineering','EVA'], bloodType:'B-' },
    { id:'a8', name:'Thomas Pesquet', agency:'ESA', status:'Training', currentMission:null, flightHours:3870, evaHours:18.6, specializations:['Science','Photography','Robotics'], bloodType:'A+' },
    { id:'a9', name:'Kate Rubins', agency:'NASA', status:'Active', currentMission:null, flightHours:2780, evaHours:8.5, specializations:['Genomics','EVA'], bloodType:'O+' },
    { id:'a10', name:'Sergei Krikalev', agency:'Roscosmos', status:'Active', currentMission:'ISS-71', flightHours:15832, evaHours:41.0, specializations:['Systems','EVA','Commander'], bloodType:'B+' },
    { id:'a11', name:'Jessica Meir', agency:'NASA', status:'Training', currentMission:null, flightHours:2340, evaHours:21.7, specializations:['Marine Biology','EVA'], bloodType:'A-' },
    { id:'a12', name:'Victor Glover', agency:'NASA', status:'Active', currentMission:'Artemis VII', flightHours:3190, evaHours:15.1, specializations:['Pilot','Engineering','EVA'], bloodType:'AB-' },
  ];
  const modules = ['Emergency Egress','Fire Suppression','EVA Suit Operations','Robotic Arm','Medical Response','Navigation'];
  const rng2 = lcg(18002);
  const training = Array.from({length:18},(_,i)=>({
    id:`tr${i+1}`, astronautId:`a${(i%12)+1}`, module:modules[i%modules.length],
    completedDate:`2025-${String((i%12)+1).padStart(2,'0')}-${String(Math.floor(rng2()*28)+1).padStart(2,'0')}`,
    score:Math.floor(rng2()*20+80), certificationExpiry:`2027-${String((i%12)+1).padStart(2,'0')}-01`,
    instructor:['Dr. Roberts','Col. Martinez','Cmdr. Chen'][i%3],
  }));
  const rng3 = lcg(18003);
  const health = Array.from({length:12},(_,i)=>({
    id:`h${i+1}`, astronautId:`a${i+1}`,
    date:`2026-01-${String(Math.floor(rng3()*14)+1).padStart(2,'0')}`,
    heartRate:Math.floor(rng3()*30+55), bloodPressure:`${Math.floor(rng3()*20+110)}/${Math.floor(rng3()*15+65)}`,
    vo2Max:Math.floor(rng3()*20+45), boneDensity:Math.floor(rng3()*20+80)/100+0.9,
    status:rng3()<0.1?'caution':'nominal',
  }));
  return { users, astronauts, training, health };
}
const g = globalThis as typeof globalThis & { __crewStore?: Store };
export const store = g.__crewStore ?? (g.__crewStore = initStore());
