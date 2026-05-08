import { getFinancials, getProperties } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n: number) => `$${(n/1e6).toFixed(2)}M`;
export default async function FinancialsPage() {
  const snaps = getFinancials();
  const props = getProperties();
  const last = snaps[snaps.length-1];
  const prev = snaps[snaps.length-2];
  const annualNOI = props.reduce((s,p)=>s+p.noi,0);
  const maxNOI = Math.max(...snaps.map(s=>s.noi));
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Financial <span style={{color:'var(--accent)'}}>Performance</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>12-month rolling · Annualized NOI {fmtM(annualNOI)}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Last Month Revenue',  value:fmtM(last.totalRevenue),  note:last.totalRevenue>prev.totalRevenue?'▲ vs prior mo':'▼ vs prior mo', c:'var(--text)'},
          {label:'Last Month Expenses', value:fmtM(last.totalExpenses), note:`${((last.totalExpenses/last.totalRevenue)*100).toFixed(1)}% expense ratio`, c:'var(--yellow)'},
          {label:'Last Month NOI',      value:fmtM(last.noi),           note:`${((last.noi/last.totalRevenue)*100).toFixed(1)}% NOI margin`, c:'var(--green)'},
          {label:'Collection Rate',     value:`${last.collectionRate.toFixed(1)}%`, note:'last month', c:last.collectionRate>=95?'var(--green)':'var(--yellow)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c,fontSize:20}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{marginBottom:18}}>
        <div className="section-title">12-Month <span>NOI Trend</span></div>
        <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100}}>
          {snaps.map((s,i)=>{
            const h=Math.round((s.noi/maxNOI)*100);
            return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <div title={`${s.month}: NOI ${fmtM(s.noi)}`} style={{width:'100%',height:`${h}px`,background:'linear-gradient(to top,var(--accent2),var(--accent))',borderRadius:'3px 3px 0 0',opacity:0.8}}/>
              <div style={{fontSize:9,color:'var(--text-muted)',transform:'rotate(-45deg)',transformOrigin:'top center',marginTop:6}}>{s.month.slice(5)}</div>
            </div>;
          })}
        </div>
      </div>
      <div className="card">
        <div className="section-title">Monthly <span>P&amp;L Breakdown</span></div>
        <table className="data-table">
          <thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>NOI</th><th>NOI Margin</th><th>Occupancy</th><th>Collection Rate</th></tr></thead>
          <tbody>
            {[...snaps].reverse().map(s=>(
              <tr key={s.month}>
                <td style={{fontFamily:'monospace',fontWeight:600}}>{s.month}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>{fmtM(s.totalRevenue)}</td>
                <td style={{color:'var(--yellow)'}}>{fmtM(s.totalExpenses)}</td>
                <td style={{fontWeight:700,color:'var(--green)'}}>{fmtM(s.noi)}</td>
                <td style={{fontFamily:'monospace'}}>{((s.noi/s.totalRevenue)*100).toFixed(1)}%</td>
                <td style={{color:s.occupancyPct>=90?'var(--green)':'var(--yellow)'}}>{s.occupancyPct.toFixed(1)}%</td>
                <td style={{color:s.collectionRate>=95?'var(--green)':'var(--yellow)'}}>{s.collectionRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
