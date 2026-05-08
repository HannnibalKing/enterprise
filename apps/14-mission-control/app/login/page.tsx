'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (res.ok) { router.push('/dashboard'); router.refresh(); }
    else { setError('Invalid credentials'); setLoading(false); }
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{width:380,padding:'2.5rem',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'2rem',fontWeight:900,letterSpacing:4,color:'var(--accent)'}}>APOLLO CMD</div>
          <div style={{color:'var(--text-soft)',fontSize:'.85rem',marginTop:4}}>Mission Control Center</div>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div>
            <label style={{fontSize:'.75rem',color:'var(--text-soft)',letterSpacing:1,textTransform:'uppercase'}}>Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} required
              style={{width:'100%',marginTop:4,padding:'.6rem .8rem',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',fontSize:'.9rem',outline:'none'}} />
          </div>
          <div>
            <label style={{fontSize:'.75rem',color:'var(--text-soft)',letterSpacing:1,textTransform:'uppercase'}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:'100%',marginTop:4,padding:'.6rem .8rem',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',fontSize:'.9rem',outline:'none'}} />
          </div>
          {error && <div style={{color:'#f87171',fontSize:'.8rem'}}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{padding:'.75rem',background:'var(--accent)',color:'#000',fontWeight:700,borderRadius:6,border:'none',cursor:'pointer',fontSize:'.9rem',letterSpacing:1,marginTop:'.5rem'}}>
            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </button>
        </form>
        <div style={{marginTop:'1.5rem',fontSize:'.75rem',color:'var(--text-muted)',textAlign:'center'}}>
          falcon / mission123 &bull; sagan / mission123 &bull; ada / mission123
        </div>
      </div>
    </div>
  );
}
