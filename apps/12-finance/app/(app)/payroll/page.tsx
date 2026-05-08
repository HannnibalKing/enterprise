import { getPayroll } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const STATUS: Record<string,{bg:string;color:string}> = {
  draft:    {bg:'rgba(255,255,255,0.05)',color:'var(--text-muted)'},
  approved: {bg:'var(--blue-dim)',       color:'var(--blue)'},
  paid:     {bg:'var(--green-dim)',      color:'var(--green)'},
};
const fmtC = (n:number) => `$${n.toLocaleString()}`;
export default async function PayrollPage() {
  const { runs, employees } = getPayroll();
  const ytdTotal = runs.filter(r=>r.status==='paid').reduce((s,r)=>s+r.totalGross,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Payroll <span style={{color:'var(--accent)'}}>Management</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{employees.length} employees · {fmtC(ytdTotal)} YTD disbursed</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:18,marginBottom:18}}>
        <div className="card">
          <div className="section-title">Payroll <span>Runs</span></div>
          <table className="data-table">
            <thead><tr><th>Period</th><th>Pay Date</th><th>HC</th><th>Gross</th><th>Taxes</th><th>Net</th><th>Status</th></tr></thead>
            <tbody>
              {runs.map(run=>{
                const ss=STATUS[run.status];
                return <tr key={run.id}>
                  <td style={{fontWeight:700,color:'var(--text)'}}>{run.period}</td>
                  <td style={{fontFamily:'monospace',fontSize:11}}>{run.payDate}</td>
                  <td style={{fontFamily:'monospace'}}>{run.headcount}</td>
                  <td style={{fontFamily:'monospace',color:'var(--accent)',fontWeight:700}}>{fmtC(run.totalGross)}</td>
                  <td style={{fontFamily:'monospace',color:'var(--red)'}}>{fmtC(run.totalTax)}</td>
                  <td style={{fontFamily:'monospace',fontWeight:700}}>{fmtC(run.totalNet)}</td>
                  <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{run.status}</span></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-title">By <span>Department</span></div>
          {['Engineering','Sales','Operations','HR','Finance','Marketing'].map(dept=>{
            const emps = employees.filter(e=>e.department===dept);
            const totalSal = emps.reduce((s,e)=>s+e.salary,0);
            return <div key={dept} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <div style={{fontWeight:700,color:'var(--text)',fontSize:12}}>{dept}</div>
                <div style={{fontFamily:'monospace',fontSize:12,color:'var(--accent)',fontWeight:700}}>{fmtC(totalSal)}</div>
              </div>
              <div style={{fontSize:10,color:'var(--text-muted)'}}>{emps.length} employees · avg ${Math.round(totalSal/Math.max(1,emps.length)/1000)}K</div>
            </div>;
          })}
        </div>
      </div>
      <div className="card">
        <div className="section-title">Employee <span>Roster</span></div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Title</th><th>Department</th><th>Annual Salary</th><th>YTD Gross</th><th>YTD Tax</th><th>YTD Benefits</th></tr></thead>
          <tbody>
            {employees.map(e=>(
              <tr key={e.id}>
                <td style={{fontWeight:700,color:'var(--text)'}}>{e.name}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{e.title}</td>
                <td style={{fontSize:11}}>{e.department}</td>
                <td style={{fontFamily:'monospace',fontWeight:700,color:'var(--accent)'}}>{fmtC(e.salary)}</td>
                <td style={{fontFamily:'monospace'}}>{fmtC(e.ytdGross)}</td>
                <td style={{fontFamily:'monospace',color:'var(--red)'}}>{fmtC(e.ytdTax)}</td>
                <td style={{fontFamily:'monospace',color:'var(--text-muted)'}}>{fmtC(e.ytdBenefits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
