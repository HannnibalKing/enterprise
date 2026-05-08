import { getTrades } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  filled:    {bg:'var(--green-dim)',  color:'var(--green)'},
  pending:   {bg:'var(--yellow-dim)', color:'var(--yellow)'},
  partial:   {bg:'var(--accent-dim)', color:'var(--accent)'},
  cancelled: {bg:'rgba(255,255,255,0.04)', color:'var(--text-muted)'},
  rejected:  {bg:'var(--red-dim)',    color:'var(--red)'},
};
export default async function TradesPage() {
  const trades = getTrades();
  const filled = trades.filter(t=>t.status==='filled');
  const totalBuy  = filled.filter(t=>t.side==='buy') .reduce((s,t)=>s+t.totalValue,0);
  const totalSell = filled.filter(t=>t.side==='sell').reduce((s,t)=>s+t.totalValue,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Trade <span style={{color:'var(--accent)'}}>Blotter</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{trades.length} orders · Buy {fmtM(totalBuy)} · Sell {fmtM(totalSell)}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        {(['filled','pending','partial','cancelled','rejected'] as const).map(s=>{
          const cnt = trades.filter(t=>t.status===s).length;
          const sty = STATUS_STYLE[s];
          return <div key={s} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:6}}>{s}</div>
            <div style={{fontSize:22,fontWeight:800,color:sty.color}}>{cnt}</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Time</th><th>Ticker</th><th>Name</th><th>Side</th><th>Qty</th><th>Price</th><th>Total Value</th><th>Status</th><th>Trader</th><th>Notes</th></tr></thead>
          <tbody>
            {trades.map(t=>{
              const sty = STATUS_STYLE[t.status];
              return <tr key={t.id}>
                <td style={{fontFamily:'monospace',fontSize:11,whiteSpace:'nowrap'}}>{new Date(t.timestamp).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                <td style={{fontWeight:800,fontFamily:'monospace',color:'var(--accent)'}}>{t.ticker}</td>
                <td style={{color:'var(--text)',fontSize:12}}>{t.name}</td>
                <td><span style={{fontWeight:800,textTransform:'uppercase',fontSize:11,color:t.side==='buy'?'var(--green)':'var(--red)',padding:'2px 8px',borderRadius:20,background:t.side==='buy'?'var(--green-dim)':'var(--red-dim)'}}>{t.side}</span></td>
                <td style={{fontFamily:'monospace'}}>{t.quantity.toLocaleString()}</td>
                <td style={{fontFamily:'monospace'}}>${t.price.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td style={{fontWeight:700}}>{fmtM(t.totalValue)}</td>
                <td><span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:sty.bg,color:sty.color,textTransform:'uppercase'}}>{t.status}</span></td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{t.traderId}</td>
                <td style={{fontSize:11,color:'var(--text-muted)',maxWidth:240}}>{t.notes}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
