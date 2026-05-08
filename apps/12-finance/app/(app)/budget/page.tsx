import { getBudget } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n:number) => `$${(n/1e6).toFixed(2)}M`;
export default async function BudgetPage() {
  const lines = getBudget();
  const totalBudget = lines.reduce((s,b)=>s+b.annualBudget,0);
  const totalActual = lines.reduce((s,b)=>s+b.ytdActual,0);
  const totalVariance = lines.reduce((s,b)=>s+b.ytdVariance,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Budget <span style={{color:'var(--accent)'}}>vs Actuals</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{lines.length} departments · Annual budget {fmtM(totalBudget)}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'Annual Budget',    v:fmtM(totalBudget),  c:'var(--accent)'},
          {l:'YTD Spend',        v:fmtM(totalActual),  c:totalActual/totalBudget*0.75>1.1?'var(--red)':'var(--text)'},
          {l:'YTD Variance',     v:fmtM(Math.abs(totalVariance)), c:totalVariance>0?'var(--green)':'var(--red)'},
        ].map(k=>(
          <div key={k.l} className="kpi">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value" style={{color:k.c,fontSize:22}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {lines.map(b=>{
          const utilPct = Math.round((b.ytdActual/(b.annualBudget*0.75))*100);
          const overBudget = utilPct > 100;
          return (
            <div key={b.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>{b.department}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>{b.category} · Annual: {fmtM(b.annualBudget)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:800,color:overBudget?'var(--red)':'var(--green)'}}>{utilPct}% utilized</div>
                  <div style={{fontSize:10,color:b.ytdVariance>0?'var(--green)':'var(--red)',marginTop:2}}>{b.ytdVariance>0?'+':''}{fmtM(b.ytdVariance)} variance</div>
                </div>
              </div>
              <div style={{width:'100%',height:6,background:'var(--surface2)',borderRadius:3,marginBottom:12}}>
                <div style={{width:`${Math.min(utilPct,100)}%`,height:'100%',borderRadius:3,background:overBudget?'var(--red)':'linear-gradient(to right,var(--accent2),var(--accent))'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[
                  {l:'Q1 Budget',  v:fmtM(b.q1Budget),    c:'var(--text-muted)'},
                  {l:'Q1 Actual',  v:fmtM(b.q1Actual),    c:b.q1Actual>b.q1Budget?'var(--red)':'var(--green)'},
                  {l:'Q2 Budget',  v:fmtM(b.q2Budget),    c:'var(--text-muted)'},
                  {l:'Q2 Actual',  v:fmtM(b.q2Actual),    c:b.q2Actual>b.q2Budget?'var(--red)':'var(--green)'},
                ].map(q=>(
                  <div key={q.l} style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:6}}>
                    <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:3}}>{q.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:q.c}}>{q.v}</div>
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
