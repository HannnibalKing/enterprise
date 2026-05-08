import { getSessionUser } from '@/lib/auth';
import { getWeather } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function WeatherPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const forecast = getWeather();
  const maxWind = Math.max(...forecast.map(w=>w.windSpeedKnots));
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Weather Forecast</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>7-day launch window assessment</p>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,margin:'0 0 1rem'}}>Wind Speed Trend (kts)</h2>
        <div style={{display:'flex',alignItems:'flex-end',gap:'0.5rem',height:'100px'}}>
          {forecast.map(w=>{
            const h = Math.max(8,w.windSpeedKnots/maxWind*90);
            return (
              <div key={w.date} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                <div style={{height:`${h}px`,width:'100%',borderRadius:'4px 4px 0 0',background:w.launchGo?'#22c55e':'#ef4444',display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:'2px',fontSize:'0.65rem',fontWeight:700,color:'white'}}>{w.windSpeedKnots}</div>
                <div style={{fontSize:'0.65rem',color:'#64748b'}}>{w.date.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Date','Forecast','Wind (kts)','Dir (°)','Visibility (nm)','Ceiling (ft)','Lightning','Status'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {forecast.map((w,i)=>(
              <tr key={w.date} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600}}>{w.date}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8'}}>{w.forecast}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:w.windSpeedKnots>25?'#ef4444':'#22c55e'}}>{w.windSpeedKnots}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b'}}>{w.windDir}</td>
                <td style={{padding:'0.5rem 0.75rem',color:w.visibilityNm<5?'#f59e0b':'#e2e8f0'}}>{w.visibilityNm}</td>
                <td style={{padding:'0.5rem 0.75rem',color:w.cloudCeilingFt<10000?'#f59e0b':'#e2e8f0'}}>{w.cloudCeilingFt.toLocaleString()}</td>
                <td style={{padding:'0.5rem 0.75rem',color:!w.lightning?'#22c55e':'#ef4444',fontWeight:600}}>{w.lightning?'YES':'none'}</td>
                <td style={{padding:'0.5rem 0.75rem'}}>
                  <span style={{padding:'0.2rem 0.6rem',borderRadius:'9999px',fontWeight:700,fontSize:'0.8rem',background:w.launchGo?'#14532d':'#7f1d1d',color:w.launchGo?'#86efac':'#fca5a5'}}>{w.launchGo?'GO':'NO-GO'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
