import { getDashboardData } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : `$${(n/1e3).toFixed(0)}K`;
const PRIO: Record<string,{bg:string;color:string}> = {
  critical: {bg:'var(--red-dim)',        color:'var(--red)'},
  high:     {bg:'rgba(251,191,36,0.10)', color:'var(--yellow)'},
  medium:   {bg:'rgba(167,139,250,0.10)',color:'var(--purple)'},
  low:      {bg:'rgba(255,255,255,0.05)',color:'var(--text-muted)'},
};
const STATUS: Record<string,{bg:string;color:string}> = {
  active:     {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  discovery:  {bg:'rgba(167,139,250,0.10)', color:'var(--purple)'},
  trial:      {bg:'var(--red-dim)',         color:'var(--red)'},
  settlement: {bg:'rgba(212,175,55,0.12)',  color:'var(--accent)'},
  closed:     {bg:'var(--green-dim)',       color:'var(--green)'},
  appeal:     {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
};
const EVT_COLOR: Record<string,string> = { hearing:'var(--red)', deposition:'var(--yellow)', filing_deadline:'var(--red)', client_meeting:'var(--blue)', trial:'var(--red)', mediation:'var(--accent)' };
export default async function DashboardPage() {
  const { metrics: m, urgentCases, upcomingEvents } = getDashboardData();
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:'0.04em',marginBottom:3}}>Firm <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>Matter management · Billing · Deadlines</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[
          {label:'Active Cases',       value:m.activeCases,                        note:'open matters',           c:'var(--blue)'},
          {label:'Total Clients',      value:m.totalClients,                       note:'client accounts',        c:'var(--text)'},
          {label:'Open AR',            value:fmtM(m.openInvoicesValue),            note:'sent + overdue',         c:'var(--accent)'},
          {label:'Overdue AR',         value:fmtM(m.overdueInvoicesValue),         note:'past due',               c:m.overdueInvoicesValue>0?'var(--red)':'var(--green)'},
          {label:'YTD Billed',         value:fmtM(m.thisMonthBilled),             note:'total invoiced',         c:'var(--text)'},
          {label:'YTD Collected',      value:fmtM(m.thisMonthCollected),          note:'cash received',          c:'var(--green)'},
          {label:'Realization Rate',   value:`${m.avgRealizationRate}%`,           note:'collected / billed',     c:m.avgRealizationRate>=90?'var(--green)':'var(--yellow)'},
          {label:'Deadlines This Week',value:m.upcomingDeadlines7d,              note:'next 7 days',            c:m.upcomingDeadlines7d>5?'var(--red)':'var(--yellow)'},
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.c}}>{k.value}</div>
            <div className="kpi-sub">{k.note}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:18}}>
        <div className="card">
          <div className="section-title">High-Priority <span>Cases</span></div>
          <table className="data-table">
            <thead><tr><th>Case #</th><th>Matter</th><th>Client</th><th>Attorney</th><th>Status</th><th>Priority</th><th>Budget Used</th></tr></thead>
            <tbody>
              {urgentCases.map(c=>{
                const ps=PRIO[c.priority]; const ss=STATUS[c.status];
                const budgetPct=Math.round((c.billedAmount/c.budgetAmount)*100);
                return <tr key={c.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{c.caseNumber}</td>
                  <td style={{fontSize:12,fontWeight:600,color:'var(--text)',maxWidth:180}}>{c.title.slice(0,28)}</td>
                  <td style={{fontSize:11,color:'var(--text-soft)'}}>{c.clientName.split(' ')[0]}</td>
                  <td style={{fontSize:11}}>{c.leadAttorney.split(' ')[0]}</td>
                  <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{c.status}</span></td>
                  <td><span className="badge" style={{background:ps.bg,color:ps.color}}>{c.priority}</span></td>
                  <td style={{fontFamily:'monospace',color:budgetPct>=90?'var(--red)':'var(--text)'}}>{budgetPct}%</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-title">Upcoming <span>Events</span></div>
          {upcomingEvents.map(evt=>(
            <div key={evt.id} style={{padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)',maxWidth:200}}>{evt.title.slice(0,30)}</div>
                <span style={{fontSize:10,fontWeight:700,color:EVT_COLOR[evt.type]??'var(--text-muted)'}}>{evt.type.replace('_',' ')}</span>
              </div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>{evt.date} {evt.time} · {evt.location}</div>
              <div style={{fontSize:11,color:'var(--text-soft)',marginTop:1}}>{evt.attorney.split(' ')[0]} · {evt.caseName.slice(0,25)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
