import { getAnalyticsData } from '@/lib/queries';
import PortfolioChartsLoader from '@/components/PortfolioChartsLoader';
export const dynamic = 'force-dynamic';
const fmtM = (n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const pct = (n:number)=>`${n>=0?'+':''}${n.toFixed(2)}%`;
export default async function AnalyticsPage() {
  const { snapshots, metrics: m, trades } = getAnalyticsData();
  const positiveDays = snapshots.filter(s=>s.dailyPnL>0).length;
  const negativeDays = snapshots.length - positiveDays;
  const avgDailyPnL  = snapshots.reduce((s,x)=>s+x.dailyPnL,0)/snapshots.length;
  const bestDay      = snapshots.reduce((a,b)=>b.dailyPnL>a.dailyPnL?b:a);
  const worstDay     = snapshots.reduce((a,b)=>b.dailyPnL<a.dailyPnL?b:a);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Analytics & <span style={{color:'var(--accent)'}}>Performance</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{snapshots.length} trading days · {trades.length} total trades</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Sharpe Ratio', value:m.sharpeRatio.toFixed(2), note:'Annualized risk-adjusted', c:'var(--green)'},
          {label:'Alpha',        value:pct(m.alpha),             note:'vs S&P 500 benchmark',    c:'var(--green)'},
          {label:'YTD P&L',      value:fmtM(m.ytdPnL),          note:pct(m.ytdPnLPct),          c:'var(--green)'},
          {label:'Info Ratio',   value:m.infoRatio.toFixed(2),   note:'Rolling 1-year',          c:'var(--accent)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:22}}><PortfolioChartsLoader snapshots={snapshots}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div className="card">
          <div className="section-title">Daily P&L <span>Statistics</span></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[
              {label:'Positive Days', value:`${positiveDays}`, note:`${((positiveDays/snapshots.length)*100).toFixed(0)}% win rate`, c:'var(--green)'},
              {label:'Negative Days', value:`${negativeDays}`, note:`${((negativeDays/snapshots.length)*100).toFixed(0)}% loss rate`, c:'var(--red)'},
              {label:'Avg Daily P&L', value:fmtM(avgDailyPnL), note:'Over period', c:'var(--green)'},
              {label:'Max Drawdown',  value:`${m.maxDrawdown.toFixed(2)}%`, note:'Portfolio peak-to-trough', c:'var(--red)'},
              {label:'Best Day',      value:fmtM(bestDay.dailyPnL), note:bestDay.date, c:'var(--green)'},
              {label:'Worst Day',     value:fmtM(worstDay.dailyPnL), note:worstDay.date, c:'var(--red)'},
            ].map(k=>(
              <div key={k.label} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:4}}>{k.label}</div>
                <div style={{fontSize:18,fontWeight:800,color:k.c}}>{k.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{k.note}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-title">Trade <span>Summary</span></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[
              {label:'Total Orders',   value:trades.length, note:'All orders'},
              {label:'Filled',         value:trades.filter(t=>t.status==='filled').length, note:'Executed'},
              {label:'Pending',        value:trades.filter(t=>t.status==='pending').length, note:'In queue'},
              {label:'Cancelled',      value:trades.filter(t=>t.status==='cancelled').length, note:'Cancelled'},
              {label:'Buy Volume',     value:fmtM(trades.filter(t=>t.side==='buy'&&t.status==='filled').reduce((s,t)=>s+t.totalValue,0)), note:'Total buy value'},
              {label:'Sell Volume',    value:fmtM(trades.filter(t=>t.side==='sell'&&t.status==='filled').reduce((s,t)=>s+t.totalValue,0)), note:'Total sell value'},
            ].map(k=>(
              <div key={k.label} style={{padding:'12px 14px',background:'var(--surface2)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:4}}>{k.label}</div>
                <div style={{fontSize:18,fontWeight:800,color:'var(--text)'}}>{k.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{k.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
