import { getSessionUser } from '@/lib/auth';
import { getAstronauts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function SchedulePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const astronauts = getAstronauts();
  const schedule = [
    { time:'06:00','mission':'Artemis VII', event:'Crew wake & morning health checks', crew:['Armstrong','Whitson','Glover'], type:'routine' },
    { time:'07:30','mission':'Artemis VII', event:'Breakfast & daily planning', crew:['Armstrong','Whitson','Glover'], type:'routine' },
    { time:'08:30','mission':'Artemis VII', event:'EVA-3 suit donning & prep', crew:['Armstrong','Glover'], type:'eva' },
    { time:'10:00','mission':'Artemis VII', event:'EVA-3 begin – lunar sample collection', crew:['Armstrong','Glover'], type:'eva' },
    { time:'10:00','mission':'Artemis VII', event:'Intravehicular – systems monitoring', crew:['Whitson'], type:'ops' },
    { time:'14:30','mission':'Artemis VII', event:'EVA-3 end – ingress & equipment stow', crew:['Armstrong','Glover'], type:'eva' },
    { time:'15:30','mission':'ISS-71', event:'ISS routine maintenance – Node 2', crew:['Tereshkova','Malenchenko'], type:'maintenance' },
    { time:'16:00','mission':'ISS-71', event:'Robotics arm training – SSRMS', crew:['Krikalev'], type:'training' },
    { time:'17:00','mission':'Artemis VII', event:'Post-EVA debriefing & sample analysis', crew:['Armstrong','Whitson','Glover'], type:'science' },
    { time:'19:00','mission':'ISS-71', event:'Ground communications window', crew:['Tereshkova','Malenchenko','Krikalev'], type:'comms' },
    { time:'21:00','mission':'Artemis VII', event:'Crew sleep – watch rotation', crew:['Whitson'], type:'routine' },
    { time:'22:00','mission':'Artemis VII', event:'Crew sleep', crew:['Armstrong','Glover'], type:'routine' },
  ];
  const typeColor: Record<string,string> = { routine:'#64748b', eva:'#f97316', ops:'#3b82f6', maintenance:'#f59e0b', training:'#a855f7', science:'#14b8a6', comms:'#22c55e' };
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Crew Schedule – 2026-01-14</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{schedule.length} events planned</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
        {schedule.map((evt,i)=>(
          <div key={i} style={{display:'flex',gap:'1rem',alignItems:'flex-start',padding:'0.75rem',background:'#1e293b',borderRadius:'0.5rem',borderLeft:`4px solid ${typeColor[evt.type]}`}}>
            <div style={{minWidth:'48px',fontWeight:700,color:'#94a3b8',fontSize:'0.85rem'}}>{evt.time}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.25rem'}}>
                <span style={{fontWeight:600,fontSize:'0.9rem'}}>{evt.event}</span>
                <span style={{padding:'0.1rem 0.4rem',borderRadius:'9999px',fontSize:'0.7rem',background:'#0f172a',color:typeColor[evt.type]}}>{evt.type}</span>
              </div>
              <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>{evt.mission}</div>
              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                {evt.crew.map(c=>(
                  <span key={c} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:'0.25rem',padding:'0.1rem 0.4rem',fontSize:'0.7rem',color:'#93c5fd'}}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
