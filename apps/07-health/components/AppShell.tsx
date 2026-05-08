'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { StaffRole } from '@/lib/types';

interface User { id:string; name:string; email:string; avatar:string; role:StaffRole; title:string; department:string; }
const NAV = [
  {href:'/dashboard', label:'Dashboard',   icon:'⬡'},
  {href:'/patients',  label:'Patients',    icon:'👤'},
  {href:'/departments',label:'Departments',icon:'🏢'},
  {href:'/er-queue',  label:'ER Queue',    icon:'🚨'},
  {href:'/alerts',    label:'Alerts',      icon:'🔔'},
  {href:'/analytics', label:'Analytics',   icon:'◎'},
];
function Clock() {
  const [t,setT]=useState('');
  useEffect(()=>{ const upd=()=>setT(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})); upd(); const id=setInterval(upd,1000); return()=>clearInterval(id); },[]);
  return <span style={{fontFamily:'monospace',fontSize:13,color:'var(--accent)',letterSpacing:'0.05em'}}>{t}</span>;
}
export default function AppShell({user,children}:{user:User;children:React.ReactNode}) {
  const router=useRouter(); const pathname=usePathname();
  async function logout(){await fetch('/api/auth/logout',{method:'POST'}); router.push('/login');}
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <aside style={{width:200,flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:32,height:32,borderRadius:7,background:'linear-gradient(135deg,#38bdf8,#0284c7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🏥</div>
            <div><div style={{fontSize:11,fontWeight:800,letterSpacing:'0.07em',color:'var(--text)'}}>MERIDIAN</div><div style={{fontSize:9,letterSpacing:'0.12em',color:'var(--accent)'}}>HEALTH</div></div>
          </div>
        </div>
        <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
          {NAV.map(item=>{const active=pathname===item.href||pathname.startsWith(item.href+'/');return(
            <a key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:6,marginBottom:2,fontSize:13,fontWeight:active?700:500,color:active?'var(--accent)':'var(--text-soft)',background:active?'rgba(56,189,248,0.1)':'transparent',borderLeft:`2px solid ${active?'var(--accent)':'transparent'}`,transition:'all 0.15s',textDecoration:'none'}}>
              <span style={{fontSize:14,opacity:active?1:0.5}}>{item.icon}</span>{item.label}
            </a>
          );})}
        </nav>
        <div style={{padding:'12px',borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',flexShrink:0}}>{user.avatar}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.name}</div>
              <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{user.title.slice(0,22)}</div>
            </div>
          </div>
          <button onClick={logout} style={{width:'100%',padding:'6px',borderRadius:5,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text-muted)',fontSize:11,fontWeight:600}}>SIGN OUT</button>
        </div>
      </aside>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <header style={{height:48,flexShrink:0,background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',padding:'0 22px',justifyContent:'space-between'}}>
          <span style={{fontSize:12,color:'var(--text-muted)',letterSpacing:'0.06em'}}>MERIDIAN HEALTH SYSTEM · <span style={{color:'var(--text-soft)'}}>Main Campus</span></span>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <Clock />
            <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',background:'var(--green-dim)',borderRadius:20,border:'1px solid rgba(52,211,153,0.25)',fontSize:11,fontWeight:700,color:'var(--green)'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',animation:'pulse 2s infinite',display:'inline-block'}}/>ALL SYSTEMS GO
            </span>
          </div>
        </header>
        <main style={{flex:1,overflowY:'auto'}}>{children}</main>
      </div>
    </div>
  );
}
