import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';

const fmtM = (n:number) => n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const fmtPnL = (n:number) => `${n>=0?'+':''}${fmtM(n)}`;
const pct = (n:number) => `${n>=0?'+':''}${n.toFixed(2)}%`;

const RISK_COLORS: Record<string,string> = { critical:'#ff4d6a', high:'#f97316', medium:'#fbbf24', low:'#00c876', info:'#00d4ff' };

export default async function DashboardPage() {
  const d = getDashboardData();
  const m = d.metrics;

  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,letterSpacing:'-0.02em',marginBottom:3}}>Portfolio <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>Live — {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:22}}>
        <div className="kpi card-accent">
          <div className="kpi-label">Total AUM</div>
          <div className="kpi-value" style={{color:'var(--accent)'}}>{fmtM(m.totalAUM)}</div>
          <div className="kpi-sub">{d.positionCount} positions</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Today's P&L</div>
          <div className="kpi-value" style={{color:m.dailyPnL>=0?'var(--green)':'var(--red)'}}>{fmtPnL(m.dailyPnL)}</div>
          <div className="kpi-sub" style={{color:m.dailyPnL>=0?'var(--green)':'var(--red)'}}>{pct(m.dailyPnLPct)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">YTD Return</div>
          <div className="kpi-value" style={{color:'var(--green)'}}>{fmtPnL(m.ytdPnL)}</div>
          <div className="kpi-sub" style={{color:'var(--green)'}}>{pct(m.ytdPnLPct)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Unrealized P&L</div>
          <div className="kpi-value" style={{color:m.totalUnrealizedPnL>=0?'var(--green)':'var(--red)'}}>{fmtPnL(m.totalUnrealizedPnL)}</div>
          <div className="kpi-sub" style={{color:m.totalUnrealizedPnL>=0?'var(--green)':'var(--red)'}}>{pct(m.totalUnrealizedPnLPct)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Cash</div>
          <div className="kpi-value">{fmtM(m.cash)}</div>
          <div className="kpi-sub">{((m.cash/m.totalAUM)*100).toFixed(1)}% of AUM</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:18,marginBottom:18}}>
        {/* Risk metrics */}
        <div className="card">
          <div className="section-title">Risk <span>Metrics</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
            {[
              {label:'Sharpe Ratio',  value:m.sharpeRatio.toFixed(2),  note:'Annualized',      good:m.sharpeRatio>1},
              {label:'Portfolio Beta',value:m.beta.toFixed(2),         note:'vs S&P 500',       good:true},
              {label:'1-Day 95% VaR', value:fmtM(m.var95),            note:'Max daily loss',   good:false, red:true},
              {label:'Max Drawdown',  value:`${m.maxDrawdown.toFixed(2)}%`, note:'Since inception', good:false, red:true},
              {label:'Alpha',         value:`${m.alpha.toFixed(2)}%`,  note:'vs benchmark',    good:m.alpha>0},
              {label:'Info Ratio',    value:m.infoRatio.toFixed(2),    note:'Rolling 1Y',      good:m.infoRatio>1},
            ].map(k=>(
              <div key={k.label} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:5}}>{k.label}</div>
                <div style={{fontSize:20,fontWeight:800,color:k.red?'var(--red)':k.good?'var(--green)':'var(--text)'}}>{k.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{k.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active alerts */}
        <div className="card">
          <div className="section-title">Risk <span>Alerts</span> <span style={{fontSize:12,color:'var(--red)',fontWeight:700}}>{d.alerts.length}</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {d.alerts.length===0 && <div style={{color:'var(--text-muted)',fontSize:13,padding:'12px 0'}}>No active alerts</div>}
            {d.alerts.map(a=>(
              <div key={a.id} style={{padding:'10px 12px',borderRadius:7,background:'var(--surface2)',border:`1px solid ${RISK_COLORS[a.level]}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:RISK_COLORS[a.level],display:'inline-block',flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:RISK_COLORS[a.level],textTransform:'uppercase',letterSpacing:'0.05em'}}>{a.level}</span>
                  {a.ticker&&<span style={{marginLeft:'auto',fontSize:11,fontFamily:'monospace',color:'var(--accent)'}}>{a.ticker}</span>}
                </div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:3}}>{a.title}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.5}}>{a.message.slice(0,90)}…</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent trades */}
      <div className="card">
        <div className="section-title">Recent <span>Trades</span></div>
        <table className="data-table">
          <thead><tr><th>Time</th><th>Ticker</th><th>Side</th><th>Qty</th><th>Price</th><th>Value</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {d.last5trades.map(t=>(
              <tr key={t.id}>
                <td style={{fontFamily:'monospace',fontSize:11}}>{new Date(t.timestamp).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</td>
                <td style={{fontWeight:700,color:'var(--text)',fontFamily:'monospace'}}>{t.ticker}</td>
                <td><span style={{fontWeight:700,color:t.side==='buy'?'var(--green)':'var(--red)',textTransform:'uppercase',fontSize:11}}>{t.side}</span></td>
                <td>{t.quantity.toLocaleString()}</td>
                <td style={{fontFamily:'monospace'}}>${t.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>{fmtM(t.totalValue)}</td>
                <td><span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:t.status==='filled'?'var(--green-dim)':t.status==='pending'?'var(--yellow-dim)':'var(--red-dim)',color:t.status==='filled'?'var(--green)':t.status==='pending'?'var(--yellow)':'var(--red)',textTransform:'uppercase'}}>{t.status}</span></td>
                <td style={{fontSize:11,color:'var(--text-muted)',maxWidth:240}}>{t.notes.slice(0,60)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
