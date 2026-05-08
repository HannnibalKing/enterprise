import { getAlerts } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const SEV: Record<string,{color:string;bg:string}> = {
  critical:{color:'#f87171',bg:'rgba(248,113,113,0.10)'},
  urgent:  {color:'#fb923c',bg:'rgba(251,146,60,0.10)'},
  warning: {color:'#fbbf24',bg:'rgba(251,191,36,0.08)'},
  info:    {color:'#38bdf8',bg:'rgba(56,189,248,0.08)'},
};
const TYPE_ICON: Record<string,string> = {patient:'👤',equipment:'⚙️',staffing:'👥',capacity:'🏥',medication:'💊',system:'🖥'};
export default async function AlertsPage() {
  const alerts = getAlerts();
  const unack  = alerts.filter(a=>!a.acknowledged);
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Hospital <span style={{color:'var(--accent)'}}>Alerts</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{unack.length} unacknowledged · {alerts.length} total</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {(['critical','urgent','warning','info'] as const).map(s=>{
          const cnt=alerts.filter(a=>a.severity===s).length;
          return <div key={s} style={{padding:'12px 14px',borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)',borderTop:`3px solid ${SEV[s].color}`}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',color:SEV[s].color,marginBottom:5}}>{s}</div>
            <div style={{fontSize:22,fontWeight:800,color:SEV[s].color}}>{cnt}</div>
          </div>;
        })}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {alerts.map(a=>{
          const sty=SEV[a.severity];
          return <div key={a.id} style={{padding:'16px 18px',borderRadius:9,background:'var(--surface)',border:`1px solid ${sty.color}22`,opacity:a.acknowledged?0.55:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span>{TYPE_ICON[a.type]??'•'}</span>
              <span style={{width:8,height:8,borderRadius:'50%',background:sty.color,display:'inline-block',flexShrink:0}}/>
              <span style={{fontSize:11,fontWeight:800,color:sty.color,textTransform:'uppercase',letterSpacing:'0.07em'}}>{a.severity}</span>
              <span style={{fontSize:11,color:'var(--text-muted)',textTransform:'capitalize'}}>{a.type}</span>
              {a.department&&<span style={{marginLeft:'auto',fontSize:11,color:'var(--accent)',fontWeight:600}}>{a.department}</span>}
              {a.acknowledged&&<span style={{fontSize:10,color:'var(--text-muted)',padding:'2px 8px',borderRadius:20,background:'var(--surface3)',marginLeft:a.department?0:'auto'}}>✓ ACKNOWLEDGED</span>}
            </div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:6}}>{a.title}</div>
            <div style={{fontSize:13,color:'var(--text-soft)',lineHeight:1.65}}>{a.message}</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:8}}>{new Date(a.timestamp).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>;
        })}
      </div>
    </div>
  );
}
