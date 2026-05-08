import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n: number) => `$${(n/1e6).toFixed(1)}M`;
export default async function DashboardPage() {
  const { metrics: m, pnl, ytdCogs } = getDashboardData();
  const grossMargin = m.ytdRevenue > 0 ? Math.round(((m.ytdRevenue - ytdCogs) / m.ytdRevenue) * 1000) / 10 : 0;
  const maxRev = Math.max(...pnl.map(p=>p.revenue),1);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:'0.04em',marginBottom:3}}>Finance <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>FY 2026 · YTD through May</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {l:'Total Assets',      v:fmtM(m.totalAssets),       c:'var(--text)',   s:'balance sheet'},
          {l:'Net Equity',        v:fmtM(m.netEquity),         c:'var(--green)',  s:'assets minus liabilities'},
          {l:'YTD Revenue',       v:fmtM(m.ytdRevenue),        c:'var(--accent)', s:'5 months'},
          {l:'Net Income',        v:fmtM(m.ytdNetIncome),      c:m.ytdNetIncome>0?'var(--green)':'var(--red)', s:`${m.netMarginPct}% margin`},
          {l:'Gross Margin',      v:`${grossMargin}%`,          c:'var(--accent)', s:'revenue − COGS'},
          {l:'Pending Payables',  v:fmtM(m.pendingPayables),   c:'var(--yellow)', s:'awaiting payment'},
          {l:'Overdue Payables',  v:fmtM(m.overduePayables),   c:m.overduePayables>1e6?'var(--red)':'var(--yellow)', s:'past due'},
          {l:'Budget Utilization',v:`${m.budgetUtilPct}%`,     c:m.budgetUtilPct>100?'var(--red)':'var(--green)', s:'YTD vs plan'},
        ].map(k=>(
          <div key={k.l} className="kpi">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value" style={{color:k.c,fontSize:24}}>{k.v}</div>
            <div className="kpi-sub">{k.s}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:18}}>
        <div className="card">
          <div className="section-title">Monthly <span>Revenue vs Net Income</span></div>
          <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100,marginBottom:8}}>
            {pnl.map((p,i)=>{
              const rh=Math.max(4,Math.round((p.revenue/maxRev)*100));
              const nh=Math.max(2,Math.round((Math.max(0,p.netIncome)/maxRev)*100));
              return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                <div style={{width:'100%',display:'flex',gap:1,alignItems:'flex-end',height:'100px'}}>
                  <div style={{flex:1,height:`${rh}px`,background:'linear-gradient(to top,var(--accent2),var(--accent))',borderRadius:'2px 2px 0 0',opacity:0.8}}/>
                  <div style={{flex:1,height:`${nh}px`,background:'linear-gradient(to top,#059669,#34d399)',borderRadius:'2px 2px 0 0',opacity:0.6}}/>
                </div>
                <div style={{fontSize:9,color:'var(--text-muted)'}}>{p.month}</div>
              </div>;
            })}
          </div>
          <div style={{display:'flex',gap:16,fontSize:10,color:'var(--text-muted)'}}>
            <span style={{color:'var(--accent)'}}>▬ Revenue</span>
            <span style={{color:'var(--green)'}}>▬ Net Income</span>
          </div>
        </div>
        <div className="card">
          <div className="section-title">P&amp;L <span>Summary</span></div>
          {pnl.slice(-5).reverse().map(p=>(
            <div key={p.month} style={{padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <div style={{fontWeight:700,color:'var(--text)',fontSize:12}}>{p.month}</div>
                <div style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{fmtM(p.revenue)}</div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{fontSize:10,color:'var(--text-muted)'}}>EBIT {p.ebitMargin}%</div>
                <div style={{fontSize:10,color:p.netIncome>0?'var(--green)':'var(--red)'}}>{fmtM(p.netIncome)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
