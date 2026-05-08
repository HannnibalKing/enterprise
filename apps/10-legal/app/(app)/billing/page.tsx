import { getInvoices } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtK = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : `$${(n/1e3).toFixed(0)}K`;
const STATUS: Record<string,{bg:string;color:string}> = {
  draft:    {bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)'},
  sent:     {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  paid:     {bg:'var(--green-dim)',       color:'var(--green)'},
  overdue:  {bg:'var(--red-dim)',         color:'var(--red)'},
  disputed: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
export default async function BillingPage() {
  const invs = getInvoices();
  const totalAR = invs.filter(i=>i.status==='sent'||i.status==='overdue').reduce((s,i)=>s+i.amount,0);
  const totalOverdue = invs.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.amount,0);
  const totalPaid = invs.filter(i=>i.status==='paid').reduce((s,i)=>s+i.paid,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Billing &amp; <span style={{color:'var(--accent)'}}>Invoices</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{invs.length} invoices · {fmtK(totalAR)} open AR · <span style={{color:totalOverdue>0?'var(--red)':'var(--green)'}}>{fmtK(totalOverdue)} overdue</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {(['draft','sent','overdue','paid'] as const).map(st=>{
          const cnt=invs.filter(i=>i.status===st).length;
          const val=invs.filter(i=>i.status===st).reduce((s,i)=>s+i.amount,0);
          const ss=STATUS[st];
          return <div key={st} style={{padding:'14px 16px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--text-muted)',marginBottom:4}}>{st}</div>
            <div style={{fontSize:22,fontWeight:800,color:ss.color}}>{cnt}</div>
            <div style={{fontSize:12,color:'var(--text-soft)',marginTop:2}}>{fmtK(val)}</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Client</th><th>Matter</th><th>Issue Date</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {invs.map(inv=>{
              const ss=STATUS[inv.status]; const balance=inv.amount-inv.paid;
              return <tr key={inv.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{inv.invoiceNumber}</td>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{inv.clientName.split(' ')[0]}</td>
                <td style={{fontSize:11,color:'var(--text-soft)',maxWidth:160}}>{inv.caseName.slice(0,25)}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{inv.issueDate}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:inv.status==='overdue'?'var(--red)':'inherit'}}>{inv.dueDate}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>{fmtK(inv.amount)}</td>
                <td style={{color:'var(--green)'}}>{fmtK(inv.paid)}</td>
                <td style={{fontWeight:700,color:balance>0?'var(--yellow)':'var(--green)'}}>{fmtK(balance)}</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{inv.status}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="section-title">Collected <span>Summary</span></div>
        <div style={{fontSize:24,fontWeight:800,color:'var(--green)'}}>{fmtK(totalPaid)}</div>
        <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>YTD cash collected</div>
      </div>
    </div>
  );
}
