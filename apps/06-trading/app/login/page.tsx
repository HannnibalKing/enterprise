'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STAFF = [
  { email:'victoria@nexuscap.com', name:'Victoria Chen — Head of Trading' },
  { email:'marcus@nexuscap.com',   name:'Marcus Okafor — Portfolio Manager' },
  { email:'elena@nexuscap.com',    name:'Elena Sorokin — Chief Risk Officer' },
  { email:'james@nexuscap.com',    name:'James Harrington — Quant Analyst' },
  { email:'riya@nexuscap.com',     name:'Riya Mehta — Compliance Officer' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(STAFF[0].email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      if (res.ok) { router.push('/dashboard'); router.refresh(); }
      else { const d = await res.json(); setError(d.error ?? 'Invalid credentials'); }
    } catch { setError('Network error'); } finally { setLoading(false); }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{width:420}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:60,height:60,borderRadius:14,background:'linear-gradient(135deg,#00d4ff 0%,#0088aa 100%)',marginBottom:14}}>
            <span style={{fontSize:26,fontWeight:900,color:'#fff'}}>N</span>
          </div>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:'0.08em',color:'var(--text)'}}>NEXUS CAPITAL</div>
          <div style={{fontSize:11,letterSpacing:'0.14em',color:'var(--accent)',marginTop:3,textTransform:'uppercase'}}>Trading Intelligence Platform</div>
        </div>
        <form onSubmit={handleSubmit} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'32px 34px'}}>
          <h2 style={{fontSize:17,fontWeight:700,marginBottom:22,color:'var(--text)'}}>Secure Sign In</h2>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:7}}>Trader</label>
            <select value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:'9px 12px',borderRadius:6,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text)',fontSize:13}}>
              {STAFF.map(s=><option key={s.email} value={s.email}>{s.name}</option>)}
            </select>
          </div>
          <div style={{marginBottom:22}}>
            <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:7}}>Password</label>
            <input type="password" placeholder="nexus123" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'9px 12px',borderRadius:6,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text)',fontSize:13}} />
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5}}>Demo: <span style={{color:'var(--accent)'}}>nexus123</span></div>
          </div>
          {error && <div style={{background:'var(--red-dim)',border:'1px solid var(--red)',borderRadius:6,padding:'9px 12px',marginBottom:14,fontSize:12,color:'var(--red)'}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width:'100%',padding:'11px',borderRadius:6,background:'var(--accent)',border:'none',color:'#000',fontSize:14,fontWeight:800,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:16,fontSize:11,color:'var(--text-muted)'}}>© 2026 Nexus Capital Management · Confidential</div>
      </div>
    </div>
  );
}
