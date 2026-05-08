import { getProductionOrders } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  in_progress: {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  scheduled:   {bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)'},
  complete:    {bg:'var(--green-dim)',       color:'var(--green)'},
  on_hold:     {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
export default async function ProductionPage() {
  const orders = getProductionOrders();
  const active = orders.filter(o=>o.status==='in_progress').length;
  const totalProduced = orders.reduce((s,o)=>s+o.quantityProduced,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Production <span style={{color:'var(--accent)'}}>Orders</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{orders.length} orders · {active} in progress · {totalProduced.toLocaleString()} total units produced</div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Order #</th><th>Product</th><th>Line</th><th>Ordered</th><th>Produced</th><th>Scrap</th><th>Yield %</th><th>Cycle vs Target</th><th>Sched Start</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o=>{
              const ss=STATUS[o.status];
              const yield_ = o.quantityProduced > 0 ? Math.round(((o.quantityProduced-o.quantityScrap)/o.quantityProduced)*1000)/10 : 0;
              const cycleDiff = o.cycleTimeSec - o.targetCycleTimeSec;
              return <tr key={o.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{o.orderNo}</td>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)',maxWidth:160}}>{o.product.slice(0,20)}</td>
                <td style={{fontFamily:'monospace',fontWeight:700}}>{o.lineName}</td>
                <td style={{fontFamily:'monospace'}}>{o.quantityOrdered.toLocaleString()}</td>
                <td style={{fontFamily:'monospace',color:'var(--text)'}}>{o.quantityProduced.toLocaleString()}</td>
                <td style={{color:o.quantityScrap>10?'var(--red)':'var(--text-muted)',fontFamily:'monospace'}}>{o.quantityScrap}</td>
                <td style={{fontWeight:700,color:yield_>=97?'var(--green)':yield_>=90?'var(--yellow)':'var(--red)'}}>{yield_}%</td>
                <td style={{fontFamily:'monospace',color:cycleDiff>3?'var(--red)':cycleDiff<-3?'var(--green)':'var(--text)'}}>{o.cycleTimeSec}s ({cycleDiff>=0?'+':''}{cycleDiff}s)</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{o.scheduledStart.slice(0,10)}</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{o.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
