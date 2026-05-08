import { getRiskData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const RISK_COLORS: Record<string,string> = {critical:'#ff4d6a',high:'#f97316',medium:'#fbbf24',low:'#00c876',info:'#00d4ff'};
export default async function RiskPage() {
  const { alerts, metrics: m, sectorPct, assetPct } = getRiskData();
  const maxSec = Math.max(...sectorPct.map(s=>s.value));
  const maxAss = Math.max(...assetPct.map(a=>a.value));
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Risk <span style={{color:'var(--accent)'}}>Management</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{alerts.filter(a=>!a.acknowledged).length} unacknowledged · {alerts.length} total alerts</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'1-Day 95% VaR',  value:fmtM(m.var95),  note:'vs $32.4M limit', color:'var(--red)',   bar:Math.abs(m.var95)/35e6},
          {label:'Portfolio Beta', value:m.beta.toFixed(2),note:'vs S&P 500',     color:'var(--yellow)',bar:m.beta/1.5},
          {label:'Max Drawdown',   value:`${m.maxDrawdown.toFixed(2)}%`,note:'YTD', color:'var(--red)',   bar:Math.abs(m.maxDrawdown)/15},
          {label:'Sharpe Ratio',   value:m.sharpeRatio.toFixed(2),note:'1Y annualized',color:'var(--green)',bar:m.sharpeRatio/3},
        ].map(k=>(
          <div key={k.label} style={{padding:'16px 18px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:k.color,marginBottom:4}}>{k.value}</div>
            <div style={{height:4,borderRadius:2,background:'var(--surface3)',marginBottom:5,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.min(k.bar*100,100)}%`,background:k.color,borderRadius:2}}/>
            </div>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>{k.note}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
        {/* Sector breakdown */}
        <div className="card">
          <div className="section-title">Sector <span>Exposure</span></div>
          {sectorPct.map(s=>(
            <div key={s.name} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,textTransform:'capitalize',color:'var(--text-soft)'}}>{s.name}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{s.value.toFixed(1)}%</span>
              </div>
              <div style={{height:6,borderRadius:3,background:'var(--surface3)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(s.value/maxSec)*100}%`,background:'linear-gradient(90deg,var(--accent),#0066ff)',borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>
        {/* Asset class breakdown */}
        <div className="card">
          <div className="section-title">Asset Class <span>Mix</span></div>
          {assetPct.map(a=>(
            <div key={a.name} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,textTransform:'capitalize',color:'var(--text-soft)'}}>{a.name.replace('_',' ')}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{a.value.toFixed(1)}%</span>
              </div>
              <div style={{height:6,borderRadius:3,background:'var(--surface3)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(a.value/maxAss)*100}%`,background:'linear-gradient(90deg,#3fb950,#0066ff)',borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* All alerts */}
      <div className="card">
        <div className="section-title">Risk <span>Alerts</span></div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {alerts.map(a=>(
            <div key={a.id} style={{padding:'14px 16px',borderRadius:8,background:'var(--surface2)',border:`1px solid ${RISK_COLORS[a.level]}25`,opacity:a.acknowledged?0.6:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:RISK_COLORS[a.level],display:'inline-block',flexShrink:0}}/>
                <span style={{fontSize:11,fontWeight:800,color:RISK_COLORS[a.level],textTransform:'uppercase',letterSpacing:'0.07em'}}>{a.level}</span>
                {a.ticker&&<span style={{fontFamily:'monospace',fontSize:12,color:'var(--accent)'}}>{a.ticker}</span>}
                {a.acknowledged&&<span style={{marginLeft:'auto',fontSize:10,color:'var(--text-muted)',padding:'2px 8px',borderRadius:20,background:'var(--surface3)'}}>ACKNOWLEDGED</span>}
              </div>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--text-soft)',lineHeight:1.6}}>{a.message}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>{new Date(a.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
