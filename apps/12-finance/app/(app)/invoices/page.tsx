import { getInvoices } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  pending:  {bg:'rgba(255,255,255,0.05)',color:'var(--text-muted)'},
  approved: {bg:'var(--blue-dim)',       color:'var(--blue)'},
  paid:     {bg:'var(--green-dim)',      color:'var(--green)'},
  overdue:  {bg:'var(--red-dim)',        color:'var(--red)'},
  disputed: {bg:'var(--yellow-dim)',     color:'var(--yellow)'},
};
const fmtC = (n:number) => `$${n.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}`;
export default async function InvoicesPage() {
  const invs = getInvoices();
  const totalPending = invs.filter(i=>['pending','approved','overdue'].includes(i.status)).reduce((s,i)=>s+i.amount-i.paidAmount,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Accounts <span style={{color:'var(--accent)'}}>Payable</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{invs.length} invoices · {fmtC(totalPending)} outstanding</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
        {(['pending','approved','paid','overdue','disputed'] as const).map(s=>{
          const cnt=invs.filter(i=>i.status===s).length;
          const tot=invs.filter(i=>i.status===s).reduce((a,i)=>a+i.amount,0);
          const ss=STATUS[s];
          return <div key={s} style={{padding:'12px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8}}>
            <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:4}}>{s}</div>
            <div style={{fontSize:22,fontWeight:800,color:ss.color}}>{cnt}</div>
            <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>${(tot/1e3).toFixed(0)}K</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Vendor</th><th>Category</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Days Overdue</th><th>Status</th></tr></thead>
          <tbody>
            {invs.map(inv=>{
              const ss=STATUS[inv.status];
              const bal=inv.amount-inv.paidAmount;
              return <tr key={inv.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{inv.invoiceNo}</td>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{inv.vendor}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{inv.category}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{inv.invoiceDate}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:inv.status==='overdue'?'var(--red)':'var(--text)'}}>{inv.dueDate}</td>
                <td style={{fontFamily:'monospace',fontWeight:700,color:'var(--text)'}}>{fmtC(inv.amount)}</td>
                <td style={{fontFamily:'monospace',color:'var(--green)'}}>{inv.paidAmount>0?fmtC(inv.paidAmount):'—'}</td>
                <td style={{fontFamily:'monospace',fontWeight:700,color:bal>0?'var(--yellow)':'var(--text-muted)'}}>{bal>0?fmtC(bal):'—'}</td>
                <td style={{fontFamily:'monospace',color:inv.daysOverdue>30?'var(--red)':inv.daysOverdue>0?'var(--yellow)':'var(--text-muted)'}}>{inv.daysOverdue>0?`${inv.daysOverdue}d`:'—'}</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{inv.status}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
