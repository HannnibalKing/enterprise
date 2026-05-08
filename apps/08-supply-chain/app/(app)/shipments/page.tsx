import {getShipments} from '@/lib/queries';
export const dynamic='force-dynamic';
const fmtB=(n:number)=>n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const MODE_ICON: Record<string,string>={ocean:'🚢',air:'✈️',ground:'🚛',rail:'🚂'};
const STATUS_COLOR: Record<string,string>={in_transit:'var(--blue)',at_port:'var(--yellow)',customs:'var(--yellow)',delivered:'var(--green)',delayed:'var(--red)',exception:'var(--red)'};
export default async function ShipmentsPage(){
  const shipments=getShipments();
  const delayed=shipments.filter(s=>s.status==='delayed'||s.status==='exception').length;
  const inTransitVal=shipments.filter(s=>s.status!=='delivered').reduce((s,x)=>s+x.valueUSD,0);
  return(
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Shipment <span style={{color:'var(--accent)'}}>Tracking</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{shipments.length} total · <span style={{color:'var(--red)'}}>{delayed} delayed/exception</span> · {fmtB(inTransitVal)} in transit</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {(['in_transit','at_port','customs','delayed','exception','delivered'] as const).slice(0,4).map(s=>{
          const cnt=shipments.filter(x=>x.status===s).length;
          const c=STATUS_COLOR[s];
          return <div key={s} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:5}}>{s.replace('_',' ')}</div>
            <div style={{fontSize:22,fontWeight:800,color:c}}>{cnt}</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Tracking</th><th>Mode</th><th>Origin</th><th>Destination</th><th>Carrier</th><th>Contents</th><th>Weight</th><th>Value</th><th>ETA</th><th>Delay</th><th>Status</th></tr></thead>
          <tbody>
            {shipments.map(s=>{
              const c=STATUS_COLOR[s.status];
              return <tr key={s.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{s.trackingNo.slice(-8)}</td>
                <td><span style={{fontSize:16}}>{MODE_ICON[s.mode]??'📦'}</span></td>
                <td style={{fontSize:11,color:'var(--text)'}}>{s.origin}</td>
                <td style={{fontSize:11,color:'var(--text)'}}>{s.destination}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{s.carrier}</td>
                <td style={{fontSize:11,maxWidth:160,color:'var(--text-soft)'}}>{s.contents}</td>
                <td style={{fontSize:11,fontFamily:'monospace'}}>{(s.weightKg/1000).toFixed(1)}t</td>
                <td style={{fontWeight:700}}>{fmtB(s.valueUSD)}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{s.etaDate}</td>
                <td style={{fontWeight:700,color:s.daysDelay>0?'var(--red)':'var(--text-muted)'}}>{s.daysDelay>0?`+${s.daysDelay}d`:'—'}</td>
                <td><span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:`${c}15`,color:c,textTransform:'uppercase',whiteSpace:'nowrap'}}>{s.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
