import { getClients } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtM = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : `$${(n/1e3).toFixed(0)}K`;
const TIER: Record<string,{bg:string;color:string}> = {
  platinum: {bg:'rgba(212,175,55,0.15)',  color:'var(--accent)'},
  gold:     {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  silver:   {bg:'rgba(255,255,255,0.06)', color:'var(--text-muted)'},
};
export default async function ClientsPage() {
  const clients = getClients();
  const totalBilled = clients.reduce((s,c)=>s+c.ytdBilled,0);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Client <span style={{color:'var(--accent)'}}>Roster</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{clients.length} clients · {fmtM(totalBilled)} YTD billed</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {clients.map(c=>{
          const ts=TIER[c.tier]; const collPct=Math.round((c.ytdCollected/c.ytdBilled)*1000)/10;
          return (
            <div key={c.id} className="card" style={{marginBottom:0}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'center'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                    <div style={{fontSize:15,fontWeight:800,color:'var(--text)'}}>{c.name}</div>
                    <span className="badge" style={{background:ts.bg,color:ts.color}}>{c.tier}</span>
                    <span style={{fontSize:10,color:'var(--text-muted)',textTransform:'capitalize'}}>{c.type} · {c.industry}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{c.contactName} · {c.contactEmail} · Client since {c.since.slice(0,4)}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,minWidth:440}}>
                  {[
                    {l:'YTD Billed',    v:fmtM(c.ytdBilled),    c:'var(--text)'},
                    {l:'YTD Collected', v:fmtM(c.ytdCollected),  c:'var(--green)'},
                    {l:'Collection %',  v:`${collPct}%`,         c:collPct>=90?'var(--green)':'var(--yellow)'},
                    {l:'Active Cases',  v:c.activeCases,         c:'var(--blue)'},
                  ].map(k=>(
                    <div key={k.l} style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:7,border:'1px solid var(--border)',textAlign:'center'}}>
                      <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)',marginBottom:3}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:800,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
