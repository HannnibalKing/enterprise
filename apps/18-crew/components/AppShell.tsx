'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
const NAV = [
  { href:'/dashboard', label:'Dashboard' },
  { href:'/crew', label:'Crew' },
  { href:'/training', label:'Training' },
  { href:'/health', label:'Health' },
  { href:'/schedule', label:'Schedule' },
];
export default function AppShell({ userName, userRole, children }: { userName:string; userRole:string; children:React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method:'POST' });
    router.push('/login'); router.refresh();
  }
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <aside style={{width:220,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',padding:'1.5rem 0',flexShrink:0}}>
        <div style={{padding:'0 1.25rem 1.5rem',borderBottom:'1px solid var(--border)'}}>
          <div style={{fontSize:'1.1rem',fontWeight:900,letterSpacing:3,color:'var(--accent)'}}>ARTEMIS OPS</div>
          <div style={{fontSize:'.7rem',color:'var(--text-soft)',marginTop:2,letterSpacing:1}}>CREW SYSTEMS</div>
        </div>
        <nav style={{flex:1,padding:'1rem 0'}}>
          {NAV.map(n=>(
            <Link key={n.href} href={n.href}
              style={{display:'block',padding:'.6rem 1.25rem',fontSize:'.85rem',color:pathname===n.href?'var(--accent)':'var(--text-soft)',background:pathname===n.href?'var(--surface2)':'transparent',borderLeft:pathname===n.href?'2px solid var(--accent)':'2px solid transparent',transition:'all .15s'}}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:'1rem 1.25rem',borderTop:'1px solid var(--border)'}}>
          <div style={{fontSize:'.8rem',color:'var(--text)',fontWeight:600}}>{userName}</div>
          <div style={{fontSize:'.7rem',color:'var(--text-soft)',marginTop:2}}>{userRole.replace(/_/g,' ').toUpperCase()}</div>
          <button onClick={logout} style={{marginTop:'.75rem',width:'100%',padding:'.4rem',background:'transparent',border:'1px solid var(--border)',borderRadius:4,color:'var(--text-soft)',fontSize:'.75rem',cursor:'pointer'}}>
            Sign Out
          </button>
        </div>
      </aside>
      <main style={{flex:1,overflow:'auto',padding:'2rem'}}>{children}</main>
    </div>
  );
}
