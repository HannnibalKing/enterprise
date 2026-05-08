import { getEquipment } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  operational: {bg:'var(--green-dim)',       color:'var(--green)'},
  degraded:    {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  offline:     {bg:'var(--red-dim)',         color:'var(--red)'},
  maintenance: {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
};
export default async function EquipmentPage() {
  const eq = getEquipment();
  const degraded = eq.filter(e=>e.status!=='operational').length;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Equipment <span style={{color:'var(--accent)'}}>Registry</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{eq.length} assets · <span style={{color:'var(--yellow)'}}>{degraded} requiring attention</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
        {eq.map(e=>{
          const ss=STATUS[e.status];
          const pmOverdue=e.nextPMDate<'2026-05-07';
          return (
            <div key={e.id} className="card" style={{borderLeft:`3px solid ${ss.color}`,marginBottom:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:'var(--text)',marginBottom:3}}>{e.name}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{e.model} · SN {e.serialNo}</div>
                  <div style={{fontSize:11,color:'var(--text-soft)',marginTop:2}}>{e.type} · {e.lineName}</div>
                </div>
                <span className="badge" style={{background:ss.bg,color:ss.color}}>{e.status}</span>
              </div>
              {e.alerts.length>0&&<div style={{padding:'6px 10px',background:'var(--red-dim)',borderRadius:5,marginBottom:10,fontSize:11,color:'var(--red)'}}>{e.alerts[0]}</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[
                  {l:'Run Hours',   v:e.totalRunHours.toLocaleString(), c:'var(--text)'},
                  {l:'MTBF',        v:`${e.mtbf}h`,                    c:'var(--green)'},
                  {l:'MTTR',        v:`${e.mttr}h`,                    c:'var(--accent)'},
                  {l:'Next PM',     v:e.nextPMDate,                    c:pmOverdue?'var(--red)':'var(--text-muted)'},
                ].map(k=>(
                  <div key={k.l} style={{padding:'7px 8px',background:'var(--surface2)',borderRadius:6}}>
                    <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:2}}>{k.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              {e.criticalSpares&&<div style={{marginTop:8,fontSize:10,color:'var(--orange)',fontWeight:600}}>⚠ Critical spares low</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
