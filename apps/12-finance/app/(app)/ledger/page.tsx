import { getLedger } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtD = (n: number) => `$${Math.abs(n).toLocaleString()}`;
const CAT_COLOR: Record<string,string> = {
  asset: 'var(--blue)', liability: 'var(--yellow)', equity: 'var(--accent)', revenue: 'var(--green)', expense: 'var(--red)'
};
export default async function LedgerPage() {
  const accounts = getLedger();
  const cats = ['asset','liability','equity','revenue','expense'] as const;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>General <span style={{color:'var(--accent)'}}>Ledger</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{accounts.length} accounts · Chart of accounts FY 2026</div>
      </div>
      {cats.map(cat=>{
        const accts = accounts.filter(a=>a.category===cat);
        const total = accts.reduce((s,a)=>s+Math.abs(a.balance),0);
        return (
          <div key={cat} className="card" style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div className="section-title" style={{marginBottom:0,fontSize:11}}>{cat.toUpperCase()} <span style={{color:CAT_COLOR[cat]}}>ACCOUNTS</span></div>
              <div style={{fontSize:13,fontWeight:800,color:CAT_COLOR[cat]}}>Total: ${(total/1e6).toFixed(2)}M</div>
            </div>
            <table className="data-table">
              <thead><tr><th>Account No</th><th>Account Name</th><th>Normal Bal</th><th>Balance</th><th>YTD Activity</th></tr></thead>
              <tbody>
                {accts.map(a=>(
                  <tr key={a.id}>
                    <td style={{fontFamily:'monospace',fontSize:11,color:CAT_COLOR[cat],fontWeight:700}}>{a.accountNo}</td>
                    <td style={{fontWeight:600,color:'var(--text)'}}>{a.accountName}</td>
                    <td><span className="badge" style={{background:`${CAT_COLOR[cat]}15`,color:CAT_COLOR[cat]}}>{a.normalBalance}</span></td>
                    <td style={{fontFamily:'monospace',fontWeight:700,color:'var(--text)'}}>{fmtD(a.balance)}</td>
                    <td style={{fontFamily:'monospace',color:a.ytdActivity>=0?'var(--green)':'var(--red)'}}>{a.ytdActivity>=0?'+':''}{fmtD(a.ytdActivity)}</td>
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
