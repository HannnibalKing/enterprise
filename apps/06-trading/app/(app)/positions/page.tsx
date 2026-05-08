import { getPositions } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const pnl = (n:number)=>`${n>=0?'+':''}${fmtM(n)}`;
const pct = (n:number)=>`${n>=0?'+':''}${n.toFixed(2)}%`;
const ASSET_LABELS: Record<string,string> = { equity:'Equities',fixed_income:'Fixed Income',etf:'ETFs',forex:'FX',commodity:'Commodities',derivative:'Derivatives' };
export default async function PositionsPage() {
  const pos = getPositions();
  const grouped: Record<string, typeof pos> = {};
  for (const p of pos) { const k=p.assetClass; (grouped[k]??=[]).push(p); }
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Positions <span style={{color:'var(--accent)'}}>({pos.length})</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>All open positions sorted by market value</div>
      </div>
      {Object.entries(grouped).map(([asset,list])=>{
        const totalMV = list.reduce((s,p)=>s+p.marketValue,0);
        return (
          <div key={asset} className="card" style={{marginBottom:18}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div className="section-title" style={{marginBottom:0}}>{ASSET_LABELS[asset]??asset}</div>
              <div style={{fontSize:12,color:'var(--text-soft)'}}>Total: <span style={{fontWeight:700,color:'var(--text)'}}>{fmtM(totalMV)}</span></div>
            </div>
            <table className="data-table">
              <thead><tr><th>Ticker</th><th>Name</th><th>Sector</th><th>Shares</th><th>Avg Cost</th><th>Price</th><th>Market Value</th><th>Unrealized P&L</th><th>Daily Chg</th><th>Weight</th><th>Beta</th></tr></thead>
              <tbody>
                {list.map(p=>(
                  <tr key={p.ticker}>
                    <td style={{fontWeight:800,fontFamily:'monospace',color:'var(--accent)'}}>{p.ticker}</td>
                    <td style={{color:'var(--text)',fontWeight:500}}>{p.name}</td>
                    <td style={{fontSize:11,color:'var(--text-muted)',textTransform:'capitalize'}}>{p.sector}</td>
                    <td style={{fontFamily:'monospace'}}>{p.shares.toLocaleString()}</td>
                    <td style={{fontFamily:'monospace'}}>${p.avgCost.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                    <td style={{fontFamily:'monospace',fontWeight:600,color:'var(--text)'}}>${p.currentPrice.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                    <td style={{fontWeight:700,color:'var(--text)'}}>{fmtM(p.marketValue)}</td>
                    <td style={{fontWeight:700,color:p.unrealizedPnL>=0?'var(--green)':'var(--red)'}}>{pnl(p.unrealizedPnL)}<br/><span style={{fontSize:11,fontWeight:500}}>{pct(p.unrealizedPnLPct)}</span></td>
                    <td style={{fontWeight:700,color:p.dailyChange>=0?'var(--green)':'var(--red)'}}>{pct(p.dailyChangePct)}</td>
                    <td>{p.weight.toFixed(1)}%</td>
                    <td style={{color:(p.beta??1)>1?'var(--yellow)':'var(--text-soft)'}}>{(p.beta??0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
