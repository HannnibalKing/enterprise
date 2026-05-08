import React, { useState } from 'react';
import { OrgNode } from '../types';

interface Props {
  nodes: OrgNode[];
  depth?: number;
}

export default function OrgChart({ nodes, depth = 0 }: Props) {
  return (
    <div style={{ paddingLeft: depth > 0 ? 28 : 0, borderLeft: depth > 0 ? '2px solid var(--border)' : 'none', marginLeft: depth > 0 ? 12 : 0 }}>
      {nodes.map((node) => (
        <OrgChartNode key={node.employee.id} node={node} depth={depth} />
      ))}
    </div>
  );
}

function OrgChartNode({ node, depth }: { node: OrgNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasReports = node.reports.length > 0;

  return (
    <div style={{ marginBottom: 6, position: 'relative' }}>
      {/* Connector */}
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: -28, top: 18, width: 26, height: 1,
          background: 'var(--border)',
        }} />
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '8px 12px',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'}
        onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>
          {node.employee.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{node.employee.firstName} {node.employee.lastName}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{node.employee.jobTitle}</div>
        </div>
        {hasReports && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}
          >
            {expanded ? '−' : `+${node.reports.length}`}
          </button>
        )}
      </div>

      {expanded && hasReports && (
        <div style={{ marginTop: 6 }}>
          <OrgChart nodes={node.reports} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}
