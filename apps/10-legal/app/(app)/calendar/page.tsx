import { getCalendarEvents } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const EVT_COLOR: Record<string,{bg:string;color:string}> = {
  hearing:          {bg:'var(--red-dim)',         color:'var(--red)'},
  deposition:       {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  filing_deadline:  {bg:'var(--red-dim)',         color:'var(--red)'},
  client_meeting:   {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  trial:            {bg:'var(--red-dim)',         color:'var(--red)'},
  mediation:        {bg:'rgba(212,175,55,0.12)',  color:'var(--accent)'},
};
export default async function CalendarPage() {
  const events = getCalendarEvents();
  const sorted = [...events].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const byDate = sorted.reduce<Record<string,typeof events>>((acc,e) => {
    if (!acc[e.date]) acc[e.date]=[];
    acc[e.date].push(e);
    return acc;
  },{});
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Legal <span style={{color:'var(--accent)'}}>Calendar</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{events.length} scheduled events · hearings, depositions, deadlines</div>
      </div>
      {Object.entries(byDate).map(([date, evts])=>(
        <div key={date} style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10,paddingBottom:6,borderBottom:'1px solid var(--border)'}}>{date}</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {evts.map(evt=>{
              const es=EVT_COLOR[evt.type];
              return (
                <div key={evt.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,borderLeft:`3px solid ${es.color}`}}>
                  <div style={{width:48,textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:800,color:'var(--text)'}}>{evt.time}</div>
                    <div style={{fontSize:10,color:'var(--text-muted)'}}>{evt.duration}min</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{evt.title}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{evt.caseName} · {evt.location}</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                    <span style={{fontSize:11,color:'var(--text-soft)'}}>{evt.attorney.split(' ')[0]}</span>
                    <span className="badge" style={{background:es.bg,color:es.color}}>{evt.type.replace('_',' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
