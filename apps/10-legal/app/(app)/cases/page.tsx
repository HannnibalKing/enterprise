import { getCases } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtK = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`;
const STATUS: Record<string,{bg:string;color:string}> = {
  active:     {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  discovery:  {bg:'rgba(167,139,250,0.10)', color:'var(--purple)'},
  trial:      {bg:'var(--red-dim)',         color:'var(--red)'},
  settlement: {bg:'rgba(212,175,55,0.12)',  color:'var(--accent)'},
  closed:     {bg:'var(--green-dim)',       color:'var(--green)'},
  appeal:     {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
const PRIO: Record<string,string> = { critical:'var(--red)', high:'var(--yellow)', medium:'var(--purple)', low:'var(--text-muted)' };
export default async function CasesPage() {
  const cases = getCases();
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Case <span style={{color:'var(--accent)'}}>Docket</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{cases.length} matters · {cases.filter(c=>c.status!=='closed').length} active</div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Case #</th><th>Matter</th><th>Client</th><th>Practice</th><th>Jurisdiction</th><th>Lead Attorney</th><th>Billed Hrs</th><th>Billed Amt</th><th>Budget Used</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {cases.map(c=>{
              const ss=STATUS[c.status]; const budgetPct=Math.round((c.billedAmount/c.budgetAmount)*100);
              return <tr key={c.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)',fontWeight:700}}>{c.caseNumber}</td>
                <td style={{fontSize:12,fontWeight:600,color:'var(--text)',maxWidth:200}}>{c.title.slice(0,30)}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{c.clientName.split(' ')[0]}</td>
                <td style={{fontSize:11,textTransform:'capitalize'}}>{c.practiceArea.replace('_',' ')}</td>
                <td style={{fontSize:11,fontFamily:'monospace'}}>{c.jurisdiction}</td>
                <td style={{fontSize:11}}>{c.leadAttorney.split(' ')[0]}</td>
                <td style={{fontFamily:'monospace'}}>{c.billedHours}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>{fmtK(c.billedAmount)}</td>
                <td style={{fontFamily:'monospace',color:budgetPct>=90?'var(--red)':budgetPct>=75?'var(--yellow)':'var(--green)'}}>{budgetPct}%</td>
                <td style={{fontWeight:700,color:PRIO[c.priority],textTransform:'capitalize'}}>{c.priority}</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{c.status}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
