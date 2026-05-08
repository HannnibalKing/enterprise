import React, { useState } from 'react';
import { Folder } from '../types';
import { api } from '../api';

interface Props {
  folders: Folder[];
  selectedFolderId: string | null | undefined;
  onSelect: (folderId: string | null) => void;
  onRefresh: () => void;
  currentUserId: string;
}

export default function FolderTree({ folders, selectedFolderId, onSelect, onRefresh, currentUserId }: Props) {
  const [creating, setCreating] = useState<string | null | false>(false);
  const [newName, setNewName] = useState('');

  const roots = folders.filter((f) => f.parentId === null);

  const handleCreate = async (parentId: string | null) => {
    if (!newName.trim()) return;
    await api.createFolder(newName.trim(), parentId ?? undefined);
    setCreating(false);
    setNewName('');
    onRefresh();
  };

  function FolderNode({ folder, depth }: { folder: Folder; depth: number }) {
    const children = folders.filter((f) => f.parentId === folder.id);
    const [expanded, setExpanded] = useState(true);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div style={{ paddingLeft: depth * 12 }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
            background: isSelected ? 'var(--accent-light)' : 'transparent',
            color: isSelected ? 'var(--accent)' : 'var(--text)',
          }}
          onClick={() => { onSelect(folder.id); }}
        >
          {children.length > 0 && (
            <span
              style={{ fontSize: 10, color: 'var(--text-muted)', width: 12, flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            >
              {expanded ? '▼' : '▶'}
            </span>
          )}
          {children.length === 0 && <span style={{ width: 12 }} />}
          <span style={{ fontSize: 14 }}>{folder.ownerId === currentUserId ? '📁' : '📂'}</span>
          <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</span>
        </div>
        {expanded && children.map((c) => <FolderNode key={c.id} folder={c} depth={depth + 1} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* All Documents */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
          background: selectedFolderId === undefined ? 'var(--accent-light)' : 'transparent',
          color: selectedFolderId === undefined ? 'var(--accent)' : 'var(--text)',
          fontSize: 13, fontWeight: 600,
        }}
        onClick={() => onSelect(undefined as unknown as null)}
      >
        🗂️ All Documents
      </div>

      {roots.map((f) => <FolderNode key={f.id} folder={f} depth={0} />)}

      {/* Create folder inline */}
      {creating !== false ? (
        <div style={{ display: 'flex', gap: 6, padding: '4px 8px' }}>
          <input
            autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Folder name…"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(null); if (e.key === 'Escape') setCreating(false); }}
            style={{ fontSize: 12 }}
          />
          <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleCreate(null)}>+</button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, padding: '4px 8px', textAlign: 'left' }}
        >
          + New folder
        </button>
      )}
    </div>
  );
}
