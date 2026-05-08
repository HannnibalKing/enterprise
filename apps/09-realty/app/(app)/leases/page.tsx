import { getLeases } from '@/lib/queries';
export const dynamic = 'force-dynamic';
const fmtK = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${(n/1e3).toFixed(0)}K`;
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  active:        {bg:'var(--green-dim)',       color:'var(--green)'},
  pending:       {bg:'rgba(96,165,250,0.10)',  color:'var(--blue)'},
  expiring_soon: {bg:'rgba(251,191,36,0.10)',  color:'var(--yellow)'},
  expired:       {bg:'var(--red-dim)',         color:'var(--red)'},
  terminated:    {bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)'},
};
export default async function LeasesPage() {
  const leases = getLeases();
  const totalARR = leases.filter(l=>l.status==='active').reduce((s,l)=>s+l.annualRent,0);
  const expiring = leases.filter(l=>l.status==='expiring_soon').length;
  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:21,fontWeight:800,marginBottom:3}}>Lease <span style={{color:'var(--accent)'}}>Management</span></div>
        <div style={{fontSize:12,color:'var(--text-muted)'}}>{leases.length} leases · {fmtK(totalARR)} annual rent roll · <span style={{color:'var(--yellow)'}}>{expiring} expiring soon</span></div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Lease #</th><th>Tenant</th><th>Property</th><th>Unit</th><th>Sq Ft</th><th>Monthly Rent</th><th>Rent PSF</th><th>Lease End</th><th>Escalation</th><th>Status</th></tr></thead>
          <tbody>
            {leases.map(l=>{
              const ss=STATUS_STYLE[l.status];
              return <tr key={l.id}>
                <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent)'}}>{l.id}</td>
                <td style={{fontWeight:600,color:'var(--text)',fontSize:12}}>{l.tenantName}</td>
                <td style={{fontSize:11,color:'var(--text-soft)'}}>{l.propertyName.split(' ').slice(0,2).join(' ')}</td>
                <td style={{fontSize:11}}>{l.unit}</td>
                <td style={{fontFamily:'monospace'}}>{l.sqFt.toLocaleString()}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>${l.monthlyRent.toLocaleString()}</td>
                <td style={{fontFamily:'monospace'}}>${l.rentPsf.toFixed(2)}</td>
                <td style={{fontFamily:'monospace',fontSize:11,color:l.status==='expiring_soon'?'var(--yellow)':'inherit'}}>{l.leaseEnd}</td>
                <td style={{fontFamily:'monospace'}}>{l.escalationPct.toFixed(1)}%</td>
                <td><span className="badge" style={{background:ss.bg,color:ss.color}}>{l.status.replace('_',' ')}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
