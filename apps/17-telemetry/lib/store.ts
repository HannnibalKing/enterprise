import bcrypt from 'bcryptjs';
import type { Store } from './types';
function lcg(seed: number) { let s=seed>>>0; return ()=>{ s=(Math.imul(1664525,s)+1013904223)>>>0; return s/0x100000000; }; }
function initStore(): Store {
  const pw = bcrypt.hashSync('tlm123', 10);
  const users = [
    { id:'u1', name:'maxwell', role:'chief_engineer', passwordHash: pw },
    { id:'u2', name:'hertz', role:'rf_engineer', passwordHash: pw },
    { id:'u3', name:'shannon', role:'data_analyst', passwordHash: pw },
    { id:'u4', name:'tesla', role:'systems_eng', passwordHash: pw },
    { id:'u5', name:'faraday', role:'ground_ops', passwordHash: pw },
  ];
  const rng = lcg(17001);
  const streams = [
    { id:'s1', spacecraft:'ISS', station:'White Sands', dataRateMbps:10.0, status:'active' as const, startTime:'2026-01-14T06:00:00Z', protocol:'CCSDS' },
    { id:'s2', spacecraft:'JWST', station:'Goldstone 70m', dataRateMbps:28.0, status:'active' as const, startTime:'2026-01-14T07:30:00Z', protocol:'CCSDS' },
    { id:'s3', spacecraft:'Mars Odyssey', station:'Madrid 34m', dataRateMbps:2.0, status:'active' as const, startTime:'2026-01-14T08:00:00Z', protocol:'CCSDS' },
    { id:'s4', spacecraft:'Voyager 1', station:'Goldstone 70m', dataRateMbps:0.00016, status:'active' as const, startTime:'2026-01-14T09:00:00Z', protocol:'DSN High Rate' },
    { id:'s5', spacecraft:'Hubble ST', station:'White Sands', dataRateMbps:1.0, status:'idle' as const, startTime:'2026-01-14T05:00:00Z', protocol:'TDRS S-band' },
    { id:'s6', spacecraft:'GOES-18', station:'Wallops', dataRateMbps:26.0, status:'active' as const, startTime:'2026-01-14T00:00:00Z', protocol:'LRIT/HRIT' },
    { id:'s7', spacecraft:'MRO', station:'Canberra 34m', dataRateMbps:4.0, status:'active' as const, startTime:'2026-01-14T04:30:00Z', protocol:'CCSDS' },
    { id:'s8', spacecraft:'GPS III-7', station:'Schriever', dataRateMbps:0.5, status:'active' as const, startTime:'2026-01-14T00:00:00Z', protocol:'L-band' },
    { id:'s9', spacecraft:'SDO', station:'White Sands', dataRateMbps:130.0, status:'active' as const, startTime:'2026-01-14T00:00:00Z', protocol:'S/X-band' },
    { id:'s10', spacecraft:'Landsat 9', station:'Svalbard', dataRateMbps:278.0, status:'active' as const, startTime:'2026-01-14T08:15:00Z', protocol:'X-band direct' },
    { id:'s11', spacecraft:'Starlink V2-1', station:'Ground Terminal', dataRateMbps:200.0, status:'active' as const, startTime:'2026-01-14T00:00:00Z', protocol:'Ku/Ka-band' },
    { id:'s12', spacecraft:'Artemis VII', station:'MILA', dataRateMbps:6.0, status:'active' as const, startTime:'2026-01-14T10:00:00Z', protocol:'S/Ku-band' },
    { id:'s13', spacecraft:'DART-2', station:'Goldstone 34m', dataRateMbps:0.1, status:'loss' as const, startTime:'2026-01-13T22:00:00Z', protocol:'X-band' },
    { id:'s14', spacecraft:'Europa Clipper', station:'Madrid 70m', dataRateMbps:0.5, status:'active' as const, startTime:'2026-01-14T11:00:00Z', protocol:'X/Ka-band' },
    { id:'s15', spacecraft:'TESS', station:'White Sands', dataRateMbps:2.0, status:'idle' as const, startTime:'2026-01-13T20:00:00Z', protocol:'X-band' },
    { id:'s16', spacecraft:'CRS-30', station:'MILA', dataRateMbps:5.0, status:'active' as const, startTime:'2026-01-14T09:45:00Z', protocol:'S-band' },
    { id:'s17', spacecraft:'Galileo-IOV-1', station:'Kiruna', dataRateMbps:1.0, status:'active' as const, startTime:'2026-01-14T00:00:00Z', protocol:'E-band' },
    { id:'s18', spacecraft:'Sentinel-2B', station:'Svalbard', dataRateMbps:520.0, status:'active' as const, startTime:'2026-01-14T07:00:00Z', protocol:'X-band' },
    { id:'s19', spacecraft:'IMAP', station:'Goldstone 34m', dataRateMbps:0.3, status:'active' as const, startTime:'2026-01-14T06:30:00Z', protocol:'X-band' },
    { id:'s20', spacecraft:'NISAR', station:'Canberra 34m', dataRateMbps:380.0, status:'active' as const, startTime:'2026-01-14T08:30:00Z', protocol:'L/S-band' },
  ];
  const rng2 = lcg(17002);
  const channelNames = ['TEMP_THRUST','PRES_LOX','VOLT_BUS','CURR_SOLAR','TEMP_PANEL','PRES_CABIN','BATT_SOC','GYRO_X','GYRO_Y','GYRO_Z'];
  const units = ['K','kPa','V','A','K','kPa','%','deg/s','deg/s','deg/s'];
  const channels = Array.from({length:40},(_,i)=>{
    const v = rng2()*200+50;
    const status = rng2()<0.05?'critical':rng2()<0.1?'warning':rng2()<0.2?'caution':'nominal';
    return { id:`ch${i+1}`, streamId:`s${(i%20)+1}`, name:channelNames[i%10], value:Math.round(v*10)/10,
      unit:units[i%10], minLimit:40, maxLimit:280, status: status as 'nominal'|'caution'|'warning'|'critical' };
  });
  const alerts = [
    { id:'al1', streamId:'s13', channelId:'ch13', timestamp:'2026-01-13T22:05:00Z', severity:'critical' as const, message:'Signal loss – DART-2 carrier dropout', acknowledged:false },
    { id:'al2', streamId:'s9', channelId:'ch9', timestamp:'2026-01-14T07:30:00Z', severity:'warning' as const, message:'SDO HMI temperature above 260K', acknowledged:true },
    { id:'al3', streamId:'s4', channelId:'ch4', timestamp:'2026-01-14T09:10:00Z', severity:'info' as const, message:'Voyager 1 RTLT now 22h 35m', acknowledged:true },
    { id:'al4', streamId:'s12', channelId:'ch12', timestamp:'2026-01-14T10:15:00Z', severity:'warning' as const, message:'Artemis VII fuel cell voltage dip', acknowledged:false },
    { id:'al5', streamId:'s1', channelId:'ch1', timestamp:'2026-01-14T06:45:00Z', severity:'info' as const, message:'ISS attitude hold maneuver complete', acknowledged:true },
  ];
  return { users, streams, channels, alerts };
}
const g = globalThis as typeof globalThis & { __telemetryStore?: Store };
export const store = g.__telemetryStore ?? (g.__telemetryStore = initStore());
