'use client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PortfolioSnapshot } from '@/lib/types';

interface Props { snapshots: PortfolioSnapshot[]; }

function fmtB(v: number) { return `$${(v/1e9).toFixed(2)}B`; }
function fmtM(v: number) { return v>=0?`+$${(v/1e6).toFixed(1)}M`:`-$${(Math.abs(v)/1e6).toFixed(1)}M`; }

export default function PortfolioCharts({ snapshots }: Props) {
  const last30 = snapshots.slice(-30).map(s=>({ date:s.date.slice(5), aum:+(s.aum/1e9).toFixed(4), pnl:+(s.dailyPnL/1e6).toFixed(2) }));
  const all90  = snapshots.map(s=>({ date:s.date.slice(5), aum:+(s.aum/1e9).toFixed(4) }));
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'18px 20px'}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:16,color:'var(--text)'}}>90-Day AUM <span style={{color:'var(--accent)'}}>Performance</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={all90}>
            <defs><linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
            <XAxis dataKey="date" tick={{fill:'#4a6278',fontSize:10}} interval={14}/>
            <YAxis tickFormatter={v=>`$${v.toFixed(1)}B`} tick={{fill:'#4a6278',fontSize:10}} width={62}/>
            <Tooltip formatter={(v:number)=>fmtB(v*1e9)} contentStyle={{background:'#0e1218',border:'1px solid #1e2d3d',borderRadius:7,fontSize:12}}/>
            <Area type="monotone" dataKey="aum" stroke="#00d4ff" strokeWidth={2} fill="url(#aumGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'18px 20px'}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:16,color:'var(--text)'}}>30-Day Daily <span style={{color:'var(--accent)'}}>P&L</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last30}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
            <XAxis dataKey="date" tick={{fill:'#4a6278',fontSize:10}} interval={6}/>
            <YAxis tickFormatter={v=>`${v>0?'+':''}$${v.toFixed(0)}M`} tick={{fill:'#4a6278',fontSize:10}} width={72}/>
            <Tooltip formatter={(v:number)=>fmtM(v*1e6)} contentStyle={{background:'#0e1218',border:'1px solid #1e2d3d',borderRadius:7,fontSize:12}}/>
            <Bar dataKey="pnl" fill="#00c876" radius={[3,3,0,0]} label={false}
              /* custom fill per bar */
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
