import {getWarehouses} from '@/lib/queries';
export const dynamic='force-dynamic';
const fmtB=(n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const TYPE_COLOR:Record<string,string>={distribution:'var(--blue)',fulfillment:'var(--accent)',cold_storage:'#38bdf8',bonded:'#a78bfa'};
export default async function InventoryPage(){
  const wh=getWarehouses();
  const totalVal=wh.reduce((s,w)=>s+w.valueUSD,0);
  const totalUnits=wh.reduce((s,w)=>s+w.totalUnits,0);
  return(
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Warehouse <span style={{color:'var(--accent)'}}>Inventory</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{wh.length} facilities · {fmtB(totalVal)} total value · {(totalUnits/1e6).toFixed(1)}M units</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Total Value',    value:fmtB(totalVal),              c:'var(--accent)'},
          {label:'Total SKUs',     value:wh.reduce((s,w)=>s+w.totalSkus,0).toLocaleString(), c:'var(--text)'},
          {label:'Avg Fill Rate',  value:`${(wh.reduce((s,w)=>s+w.fillPct,0)/wh.length).toFixed(1)}%`, c:'var(--yellow)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:18}}>
        {wh.map(w=>{
          const c=w.fillPct>=90?'var(--red)':w.fillPct>=75?'var(--yellow)':'var(--green)';
          const tc=TYPE_COLOR[w.type]??'var(--text-soft)';
          return(
            <div key={w.id} className="card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>{w.name}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{w.location} · <span style={{color:tc,textTransform:'capitalize'}}>{w.type.replace('_',' ')}</span></div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:22,fontWeight:800,color:c}}>{w.fillPct}%</div>
                  <div style={{fontSize:10,color:'var(--text-muted)'}}>capacity</div>
                </div>
              </div>
              <div style={{height:6,borderRadius:3,background:'var(--surface3)',overflow:'hidden',marginBottom:14}}>
                <div style={{height:'100%',width:`${w.fillPct}%`,background:c,borderRadius:3}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
                {[
                  {l:'Total Units',    v:(w.totalUnits/1e3).toFixed(0)+'K', c:'var(--text)'},
                  {l:'SKUs',           v:w.totalSkus.toLocaleString(), c:'var(--text)'},
                  {l:'Value',          v:fmtB(w.valueUSD), c:'var(--accent)'},
                  {l:'Inbound Today',  v:w.inboundToday,   c:'var(--green)'},
                  {l:'Outbound Today', v:w.outboundToday,  c:'var(--blue)'},
                  {l:'Cap (sqm)',       v:`${(w.usedCapacitySqM/1000).toFixed(0)}K/${(w.totalCapacitySqM/1000).toFixed(0)}K`,c:'var(--text-soft)'},
                ].map(k=>(
                  <div key={k.l} style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:6}}>
                    <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:3}}>{k.l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>Manager: <span style={{color:'var(--text-soft)'}}>{w.manager}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
