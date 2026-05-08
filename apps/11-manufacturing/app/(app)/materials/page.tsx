import { getMaterials } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  in_stock:     {bg:'var(--green-dim)',       color:'var(--green)'},
  low_stock:    {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  out_of_stock: {bg:'var(--red-dim)',         color:'var(--red)'},
  on_order:     {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
};
const fmtC = (n: number) => `$${n.toFixed(2)}`;
export default async function MaterialsPage() {
  const mats = getMaterials();
  const totalValue = mats.reduce((s,m)=>s+m.onHandQty*m.unitCost,0);
  const critical = mats.filter(m=>m.status!=='in_stock').length;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Materials <span style={{color:'var(--accent)'}}>Inventory</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{mats.length} materials · ${(totalValue/1e3).toFixed(0)}K value on hand · <span style={{color:'var(--yellow)'}}>{critical} critical items</span></div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>SKU</th><th>Material</th><th>Category</th><th>On Hand</th><th>Reorder Pt</th><th>Days Supply</th><th>Unit Cost</th><th>Total Value</th><th>Supplier</th><th>Lead Time</th><th>Status</th></tr></thead>
          <tbody>
            {mats.map(m=>{
              const ss=STATUS[m.status];
              const totalVal=m.onHandQty*m.unitCost;
              return <tr key={m.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{m.sku}</td>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{m.name}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{m.category}</td>
                <td style={{fontFamily:'monospace',fontWeight:700,color:m.onHandQty===0?'var(--red)':m.onHandQty<m.reorderPoint?'var(--yellow)':'var(--text)'}}>{m.onHandQty.toLocaleString()}</td>
                <td style={{fontFamily:'monospace',color:'var(--text-muted)'}}>{m.reorderPoint}</td>
                <td style={{fontFamily:'monospace',color:m.daysOfSupply<7?'var(--red)':m.daysOfSupply<14?'var(--yellow)':'var(--green)',fontWeight:700}}>{m.daysOfSupply}</td>
                <td style={{fontFamily:'monospace'}}>{fmtC(m.unitCost)}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>${(totalVal/1e3).toFixed(1)}K</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{m.supplier}</td>
                <td style={{fontFamily:'monospace'}}>{m.leadTimeDays}d</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{m.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
