import { getProperties } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmt = (n: number) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : `$${(n/1e6).toFixed(1)}M`;
const TYPE_COLOR: Record<string,string> = { office:'var(--blue)', retail:'var(--gold)', industrial:'var(--text-soft)', mixed_use:'var(--accent)', multifamily:'var(--green)' };
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  stabilized: {bg:'var(--green-dim)',       color:'var(--green)'},
  lease_up:   {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  vacant:     {bg:'var(--red-dim)',         color:'var(--red)'},
  renovation: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
export default async function PropertiesPage() {
  const props = getProperties();
  const totalVal = props.reduce((s,p)=>s+p.currentValue,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Property <span style={{color:'var(--accent)'}}>Portfolio</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{props.length} assets · {fmt(totalVal)} total value</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
        {props.map(p=>{
          const ss=STATUS_STYLE[p.status];
          const tc=TYPE_COLOR[p.type];
          const gain=p.currentValue-p.purchasePrice;
          const gainPct=Math.round((gain/p.purchasePrice)*1000)/10;
          const occC=p.occupancyPct>=90?'var(--green)':p.occupancyPct>=75?'var(--yellow)':'var(--red)';
          return (
            <div key={p.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:'var(--text)',marginBottom:4}}>{p.name}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{p.address}, {p.city}, {p.state}</div>
                  <div style={{display:'flex',gap:8,marginTop:6}}>
                    <span className="badge" style={{background:`${tc}15`,color:tc,border:`1px solid ${tc}25`}}>{p.type.replace('_',' ')}</span>
                    <span className="badge" style={{background:ss.bg,color:ss.color}}>{p.status.replace('_',' ')}</span>
                    <span style={{fontSize:10,color:'var(--text-muted)'}}>Built {p.yearBuilt}</span>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--accent)'}}>{fmt(p.currentValue)}</div>
                  <div style={{fontSize:11,color:gain>=0?'var(--green)':'var(--red)',marginTop:2}}>{gain>=0?'+':''}{gainPct}% vs purchase</div>
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'var(--text-muted)'}}>Occupancy</span>
                  <span style={{fontSize:12,fontWeight:700,color:occC}}>{p.occupancyPct}%</span>
                </div>
                <div style={{height:5,borderRadius:3,background:'var(--surface3)',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${p.occupancyPct}%`,background:occC,borderRadius:3}}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[
                  {l:'Cap Rate',   v:`${p.capRate}%`,                           c:'var(--gold)'},
                  {l:'NOI',        v:`$${(p.noi/1e6).toFixed(2)}M`,            c:'var(--green)'},
                  {l:p.type==='multifamily'?'Units':'Sq Ft', v:p.type==='multifamily'?`${p.leasedUnits}/${p.units}`:`${(p.leasedSqFt/1000).toFixed(0)}K/${(p.totalSqFt/1000).toFixed(0)}K`, c:'var(--text)'},
                  {l:'Manager',    v:p.manager.split(' ')[0],                   c:'var(--text-soft)'},
                ].map(k=>(
                  <div key={k.l} style={{padding:'7px 9px',background:'var(--surface2)',borderRadius:6}}>
                    <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:2}}>{k.l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
