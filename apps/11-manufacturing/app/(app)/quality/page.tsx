import { getQualityChecks } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const RESULT: Record<string,{bg:string;color:string}> = {
  pass:        {bg:'var(--green-dim)',       color:'var(--green)'},
  fail:        {bg:'var(--red-dim)',         color:'var(--red)'},
  conditional: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
export default async function QualityPage() {
  const checks = getQualityChecks();
  const passRate = Math.round((checks.filter(c=>c.result==='pass').length/checks.length)*1000)/10;
  const avgDefect = Math.round(checks.reduce((s,c)=>s+c.defectRate,0)/checks.length*100)/100;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Quality <span style={{color:'var(--accent)'}}>Control</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{checks.length} inspections · {passRate}% pass rate · {avgDefect}% avg defect rate</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {(['pass','conditional','fail'] as const).map(r=>{
          const cnt=checks.filter(c=>c.result===r).length;
          const rs=RESULT[r];
          return <div key={r} style={{padding:'14px 16px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:4}}>{r}</div>
            <div style={{fontSize:24,fontWeight:800,color:rs.color}}>{cnt}</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{Math.round((cnt/checks.length)*100)}%</div>
          </div>;
        })}
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Check #</th><th>Product</th><th>Check Type</th><th>Date</th><th>Inspector</th><th>Sample</th><th>Defects</th><th>Defect Rate</th><th>Result</th></tr></thead>
          <tbody>
            {checks.map(c=>{
              const rs=RESULT[c.result];
              return <tr key={c.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{c.id}</td>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)',maxWidth:160}}>{c.product.slice(0,18)}</td>
                <td style={{fontSize:11}}>{c.checkType}</td>
                <td style={{fontFamily:'monospace',fontSize:11}}>{c.checkDate}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{c.inspector}</td>
                <td style={{fontFamily:'monospace'}}>{c.sampleSize}</td>
                <td style={{fontFamily:'monospace',color:c.defects>5?'var(--red)':'var(--text)'}}>{c.defects}</td>
                <td style={{fontWeight:700,color:c.defectRate>3?'var(--red)':c.defectRate>1.5?'var(--yellow)':'var(--green)'}}>{c.defectRate}%</td>
                <td><span className="badge" style={{background:rs.bg,color:rs.color}}>{c.result}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
