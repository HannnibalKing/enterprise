import {getSuppliers} from '@/lib/queries';
export const dynamic='force-dynamic';
const fmtB=(n:number)=>n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  approved:  {bg:'var(--green-dim)',  color:'var(--green)'},
  probation: {bg:'var(--yellow-dim)', color:'var(--yellow)'},
  suspended: {bg:'var(--red-dim)',    color:'var(--red)'},
};
export default async function SuppliersPage(){
  const suppliers=getSuppliers();
  const totalSpend=suppliers.reduce((s,x)=>s+x.ytdSpendUSD,0);
  const avgOTD=suppliers.reduce((s,x)=>s+x.onTimeDeliveryPct,0)/suppliers.length;
  return(
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Supplier <span style={{color:'var(--accent)'}}>Scorecards</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{suppliers.length} suppliers · {fmtB(totalSpend)} YTD spend · {avgOTD.toFixed(1)}% avg OTD</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {suppliers.map(s=>{
          const sty=STATUS_STYLE[s.status];
          const riskC=s.riskScore>=50?'var(--red)':s.riskScore>=25?'var(--yellow)':'var(--green)';
          const otdC=s.onTimeDeliveryPct>=90?'var(--green)':s.onTimeDeliveryPct>=75?'var(--yellow)':'var(--red)';
          return(
            <div key={s.id} className="card">
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'start'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>{s.name}</div>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:sty.bg,color:sty.color,textTransform:'uppercase'}}>{s.status}</span>
                    <span style={{fontSize:11,padding:'2px 7px',borderRadius:4,background:'var(--surface3)',color:'var(--text-muted)'}}>Tier {s.tier}</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>{s.country} · {s.category} · {s.contactEmail}</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {s.certifications.map(c=><span key={c} style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(96,165,250,0.10)',color:'var(--blue)',border:'1px solid rgba(96,165,250,0.15)'}}>{c}</span>)}
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,minWidth:480}}>
                  {[
                    {l:'On-Time Delivery', v:`${s.onTimeDeliveryPct.toFixed(1)}%`, c:otdC},
                    {l:'Quality Score',    v:`${s.qualityScore}/100`,               c:s.qualityScore>=90?'var(--green)':'var(--yellow)'},
                    {l:'Risk Score',       v:`${s.riskScore}/100`,                  c:riskC},
                    {l:'Lead Time',        v:`${s.leadTimeDays} days`,              c:'var(--text)'},
                    {l:'YTD Spend',        v:fmtB(s.ytdSpendUSD),                  c:'var(--accent)'},
                    {l:'Open Orders',      v:s.activeOrders,                        c:'var(--text)'},
                  ].map(k=>(
                    <div key={k.l} style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:7,border:'1px solid var(--border)'}}>
                      <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:3}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:800,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
