import {getOrders} from '@/lib/queries';
export const dynamic='force-dynamic';
const fmtB=(n:number)=>n>=1e6?`$${(n/1e6).toFixed(1)}M`:`$${(n/1e3).toFixed(0)}K`;
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  draft:         {bg:'rgba(255,255,255,0.05)',color:'var(--text-muted)'},
  confirmed:     {bg:'rgba(96,165,250,0.10)', color:'var(--blue)'},
  in_production: {bg:'rgba(251,191,36,0.10)', color:'var(--yellow)'},
  shipped:       {bg:'rgba(251,146,60,0.10)', color:'var(--accent)'},
  delivered:     {bg:'var(--green-dim)',       color:'var(--green)'},
  cancelled:     {bg:'var(--red-dim)',         color:'var(--red)'},
};
export default async function OrdersPage(){
  const orders=getOrders();
  const open=orders.filter(o=>o.status!=='delivered'&&o.status!=='cancelled');
  const totalOpenVal=open.reduce((s,o)=>s+o.totalValueUSD,0);
  return(
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Purchase <span style={{color:'var(--accent)'}}>Orders</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{orders.length} orders · {open.length} open · {fmtB(totalOpenVal)} open value</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        {(['confirmed','in_production','shipped','delivered','cancelled'] as const).map(s=>{
          const cnt=orders.filter(o=>o.status===s).length;
          const sty=STATUS_STYLE[s];
          return <div key={s} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:5}}>{s.replace('_',' ')}</div>
            <div style={{fontSize:22,fontWeight:800,color:sty.color}}>{cnt}</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>PO Number</th><th>Supplier</th><th>Item</th><th>Qty</th><th>Value</th><th>Order Date</th><th>ETA</th><th>Required</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o=>{
              const sty=STATUS_STYLE[o.status];
              const item=o.items[0];
              return <tr key={o.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{o.poNumber}</td>
                <td style={{fontWeight:500,color:'var(--text)',fontSize:12}}>{o.supplierName}</td>
                <td style={{fontSize:11,color:'var(--text-soft)',maxWidth:200}}>{item?.description??'—'}</td>
                <td style={{fontFamily:'monospace'}}>{item?.qty.toLocaleString()??'—'}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>{fmtB(o.totalValueUSD)}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{o.orderDate}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{o.etaDate}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{o.requiredDate}</td>
                <td><span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:sty.bg,color:sty.color,textTransform:'uppercase',whiteSpace:'nowrap'}}>{o.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
