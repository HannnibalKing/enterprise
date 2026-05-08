import { getSessionUser } from '@/lib/auth';
import { getLinks, getContacts } from '@/lib/queries';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function LinksPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const links = getLinks();
  const contacts = getContacts();
  const cMap = Object.fromEntries(contacts.map(c=>[c.id,c.spacecraft]));
  return (
    <div>
      <div style={{marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,margin:0}}>Link Budgets</h1>
        <p style={{color:'#94a3b8',marginTop:'0.25rem'}}>{links.length} link records</p>
      </div>
      <div style={{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #334155',color:'#64748b',textAlign:'left'}}>
              {['Spacecraft','EIRP (dBW)','SNR (dB)','Range (km)','RTLT (s)','Bit Error Rate'].map(h=>(
                <th key={h} style={{padding:'0.5rem 0.75rem',fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map((l,i)=>(
              <tr key={l.id} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#0f172a':'transparent'}}>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:700,color:'#06b6d4'}}>{cMap[l.contactId]??l.contactId}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:'#f59e0b'}}>{l.eirpDbw}</td>
                <td style={{padding:'0.5rem 0.75rem',fontWeight:600,color:l.snrDb>=15?'#22c55e':'#ef4444'}}>{l.snrDb}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8'}}>{l.rangeKm.toLocaleString()}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#64748b'}}>{l.rtltSec}</td>
                <td style={{padding:'0.5rem 0.75rem',color:'#94a3b8',fontFamily:'monospace',fontSize:'0.75rem'}}>{l.bitErrorRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
