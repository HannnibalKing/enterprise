import { getDepartments } from '@/lib/queries';
export const dynamic = 'force-dynamic';
export default async function DepartmentsPage() {
  const depts = getDepartments();
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Department <span style={{color:'var(--accent)'}}>Overview</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{depts.length} active departments · {depts.reduce((s,d)=>s+d.totalBeds,0)} total beds</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:18}}>
        {depts.map(dept=>{
          const occ=Math.round((dept.occupiedBeds/dept.totalBeds)*100);
          const occC=occ>=90?'var(--red)':occ>=75?'var(--yellow)':'var(--green)';
          return (
            <div key={dept.id} className="card" style={{borderLeft:`4px solid ${dept.color}`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:24}}>{dept.icon}</span>
                  <div>
                    <div style={{fontSize:16,fontWeight:800,color:'var(--text)'}}>{dept.name}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>Floor {dept.floor} · {dept.wing} Wing</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:24,fontWeight:800,color:occC}}>{occ}%</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>Occupancy</div>
                </div>
              </div>
              <div style={{height:6,borderRadius:3,background:'var(--surface3)',marginBottom:14,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${occ}%`,background:dept.color,borderRadius:3}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
                {[
                  {label:'Total Beds', value:dept.totalBeds, c:'var(--text)'},
                  {label:'Occupied',   value:dept.occupiedBeds, c:occC},
                  {label:'Available',  value:dept.availableBeds, c:dept.availableBeds===0?'var(--red)':'var(--green)'},
                  {label:'Maint.',     value:dept.maintenanceBeds, c:'var(--yellow)'},
                ].map(k=>(
                  <div key={k.label} style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:7,textAlign:'center'}}>
                    <div style={{fontSize:16,fontWeight:800,color:k.c}}>{k.value}</div>
                    <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-muted)',marginTop:2}}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12}}>
                <div style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:6}}>
                  <div style={{color:'var(--text-muted)',fontSize:10,marginBottom:2}}>DEPT HEAD</div>
                  <div style={{color:'var(--text)',fontWeight:600}}>{dept.headPhysician}</div>
                </div>
                <div style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:6}}>
                  <div style={{color:'var(--text-muted)',fontSize:10,marginBottom:2}}>NURSE MANAGER</div>
                  <div style={{color:'var(--text)',fontWeight:600}}>{dept.nurseManager}</div>
                </div>
                <div style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:6}}>
                  <div style={{color:'var(--text-muted)',fontSize:10,marginBottom:2}}>AVG LENGTH STAY</div>
                  <div style={{color:'var(--accent)',fontWeight:700}}>{dept.avgLOS} days</div>
                </div>
                <div style={{padding:'8px 10px',background:'var(--surface2)',borderRadius:6}}>
                  <div style={{color:'var(--text-muted)',fontSize:10,marginBottom:2}}>READMISSION RATE</div>
                  <div style={{color:dept.readmissionRate>5?'var(--yellow)':'var(--green)',fontWeight:700}}>{dept.readmissionRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
