import React, { useState, useRef } from 'react';
import { Document, User, Folder } from '../types';
import { api } from '../api';

const MIME_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  'text/plain': '📃',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
};

function fileIcon(mime: string) { return MIME_ICONS[mime] ?? '📎'; }
function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

interface Props {
  documents: Document[];
  folders: Folder[];
  allUsers: User[];
  currentUserId: string;
  selectedFolderId: string | null | undefined;
  onRefresh: () => void;
}

export default function DocumentGrid({ documents: docs, folders, allUsers, currentUserId, selectedFolderId, onRefresh }: Props) {
  const [selected, setSelected] = useState<Document | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showVersionUpload, setShowVersionUpload] = useState(false);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionComment, setVersionComment] = useState('');
  const [showShare, setShowShare] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const folderMap = Object.fromEntries(folders.map((f) => [f.id, f.name]));
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !uploadName) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', uploadName || uploadFile?.name || 'Untitled');
      if (selectedFolderId) fd.append('folderId', selectedFolderId);
      if (uploadTags) fd.append('tags', uploadTags);
      if (uploadFile) fd.append('file', uploadFile);
      await api.createDocument(fd);
      setShowUpload(false); setUploadName(''); setUploadTags(''); setUploadFile(null);
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionFile || !selected) return;
    const fd = new FormData();
    fd.append('file', versionFile);
    fd.append('comment', versionComment);
    await api.uploadVersion(selected.id, fd);
    setShowVersionUpload(false); setVersionFile(null); setVersionComment('');
    const updated = await api.getDocument(selected.id);
    setSelected(updated);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this document?')) return;
    await api.deleteDocument(selected.id);
    setSelected(null);
    onRefresh();
  };

  const handleDropFile = async (file: File) => {
    const fd = new FormData();
    fd.append('name', file.name);
    if (selectedFolderId) fd.append('folderId', selectedFolderId);
    fd.append('file', file);
    await api.createDocument(fd);
    onRefresh();
  };

  const docCardStyle = (doc: Document): React.CSSProperties => ({
    background: selected?.id === doc.id ? 'var(--accent-light)' : 'var(--surface)',
    border: `1px solid ${selected?.id === doc.id ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
    borderRadius: 10, padding: 14, cursor: 'pointer', transition: 'border-color 0.15s',
  });

  const currentVer = selected?.versions.find((v) => v.version === selected.currentVersion);

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', overflow: 'hidden' }}>
      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: 13 }}>
            {docs.length} document{docs.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['grid', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? 'var(--accent-light)' : 'none', border: `1px solid ${view === v ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, color: view === v ? 'var(--accent)' : 'var(--text-muted)', borderRadius: 6, padding: '5px 10px', fontSize: 12 }}>
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>+ Upload</button>
        </div>

        {/* Upload form */}
        {showUpload && (
          <form onSubmit={handleUpload} className="card" style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600 }}>Upload Document</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>DOCUMENT NAME</label>
                <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Auto from filename" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>TAGS (comma separated)</label>
                <input value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="design, q3, draft" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>FILE</label>
              <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
            </div>
          </form>
        )}

        {/* Drop zone */}
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={async (e) => { e.preventDefault(); setDraggingOver(false); const f = e.dataTransfer.files[0]; if (f) await handleDropFile(f); }}
          style={{ flex: 1, overflowY: 'auto', borderRadius: 10, border: draggingOver ? '2px dashed var(--accent)' : '2px dashed transparent', transition: 'border 0.15s', padding: 4 }}
        >
          {view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {docs.map((doc) => {
                const ver = doc.versions.find((v) => v.version === doc.currentVersion);
                return (
                  <div key={doc.id} style={docCardStyle(doc)} onClick={() => setSelected(doc)}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{ver ? fileIcon(ver.mimeType) : '📎'}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>v{doc.currentVersion} · {ver ? formatBytes(ver.size) : '—'}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {doc.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--accent-light)', color: 'var(--accent)' }}>{t}</span>)}
                    </div>
                  </div>
                );
              })}
              {docs.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p>Drop files here or click Upload</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {docs.map((doc) => {
                const ver = doc.versions.find((v) => v.version === doc.currentVersion);
                return (
                  <div key={doc.id} style={{ ...docCardStyle(doc), display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }} onClick={() => setSelected(doc)}>
                    <span style={{ fontSize: 20 }}>{ver ? fileIcon(ver.mimeType) : '📎'}</span>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{folderMap[doc.folderId ?? ''] ?? 'Root'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>v{doc.currentVersion}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{ver ? formatBytes(ver.size) : '—'}</span>
                  </div>
                );
              })}
              {docs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No documents found.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="card" style={{ width: 300, flexShrink: 0, marginLeft: 16, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{currentVer ? fileIcon(currentVer.mimeType) : '📎'}</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selected.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {folderMap[selected.folderId ?? ''] ?? 'Root'} · v{selected.currentVersion}
            </div>
          </div>

          {/* Tags */}
          {selected.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {selected.tags.map((t) => <span key={t} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--accent-light)', color: 'var(--accent)' }}>{t}</span>)}
            </div>
          )}

          {/* Version history */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>VERSION HISTORY</span>
              {selected.ownerId === currentUserId && (
                <button onClick={() => setShowVersionUpload(!showVersionUpload)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11 }}>+ Upload</button>
              )}
            </div>
            {showVersionUpload && (
              <form onSubmit={handleNewVersion} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="file" onChange={(e) => setVersionFile(e.target.files?.[0] ?? null)} required />
                <input value={versionComment} onChange={(e) => setVersionComment(e.target.value)} placeholder="Version comment…" />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 12 }}>Upload</button>
                  <button type="button" className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowVersionUpload(false)}>×</button>
                </div>
              </form>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...selected.versions].reverse().map((v) => (
                <div key={v.version} style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 10px', border: v.version === selected.currentVersion ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: v.version === selected.currentVersion ? 'var(--accent)' : 'var(--text)' }}>v{v.version}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatBytes(v.size)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{v.filename}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>by {userMap[v.uploadedBy]?.name ?? v.uploadedBy}</div>
                  {v.comment && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>"{v.comment}"</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Shares */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>SHARED WITH</span>
              {selected.ownerId === currentUserId && (
                <button onClick={() => setShowShare(!showShare)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11 }}>Edit</button>
              )}
            </div>
            {showShare && (
              <ShareEditor doc={selected} allUsers={allUsers} currentUserId={currentUserId} onSave={async (shares) => { const updated = await api.updateShares(selected.id, shares); setSelected(updated); setShowShare(false); onRefresh(); }} onCancel={() => setShowShare(false)} />
            )}
            {!showShare && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selected.shares.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not shared</p>}
                {selected.shares.map((s) => (
                  <div key={s.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{userMap[s.userId]?.avatar ?? '?'}</div>
                    <span style={{ flex: 1, fontSize: 12 }}>{userMap[s.userId]?.name ?? s.userId}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.permission}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected.ownerId === currentUserId && (
            <button className="btn-danger" style={{ width: '100%' }} onClick={handleDelete}>Delete Document</button>
          )}
        </div>
      )}
    </div>
  );
}

function ShareEditor({ doc, allUsers, currentUserId, onSave, onCancel }: {
  doc: Document; allUsers: User[]; currentUserId: string;
  onSave: (shares: import('../types').ShareEntry[]) => void;
  onCancel: () => void;
}) {
  const [shares, setShares] = useState(doc.shares.map((s) => ({ ...s })));
  const others = allUsers.filter((u) => u.id !== currentUserId && u.id !== doc.ownerId);

  const toggle = (userId: string) => {
    if (shares.some((s) => s.userId === userId)) {
      setShares(shares.filter((s) => s.userId !== userId));
    } else {
      setShares([...shares, { userId, permission: 'view' }]);
    }
  };

  const setPerm = (userId: string, perm: import('../types').Permission) => {
    setShares(shares.map((s) => s.userId === userId ? { ...s, permission: perm } : s));
  };

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
      {others.map((u) => {
        const entry = shares.find((s) => s.userId === u.id);
        return (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <input type="checkbox" checked={!!entry} onChange={() => toggle(u.id)} style={{ width: 14, height: 14, accentColor: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12 }}>{u.name}</span>
            {entry && (
              <select value={entry.permission} onChange={(e) => setPerm(u.id, e.target.value as import('../types').Permission)} style={{ width: 70, fontSize: 11, padding: '2px 4px' }}>
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
            )}
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button className="btn-primary" style={{ flex: 1, fontSize: 12 }} onClick={() => onSave(shares)}>Save</button>
        <button className="btn-secondary" style={{ fontSize: 12 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
