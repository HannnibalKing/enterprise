import React, { useCallback, useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import FolderTree from './components/FolderTree';
import DocumentGrid from './components/DocumentGrid';
import { Document, Folder, User } from './types';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('docs_token');
    if (t) { api.me().then((u) => { setUser(u); setAuthChecked(true); }).catch(() => { localStorage.removeItem('docs_token'); setAuthChecked(true); }); }
    else setAuthChecked(true);
  }, []);

  const loadData = useCallback(async () => {
    const [fols, docs, us] = await Promise.all([api.getFolders(), api.getDocuments(selectedFolderId), api.getUsers()]);
    setFolders(fols);
    setDocuments(docs);
    setAllUsers(us);
  }, [selectedFolderId]);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      const results = await api.searchDocuments(q);
      setDocuments(results);
    } else {
      const docs = await api.getDocuments(selectedFolderId);
      setDocuments(docs);
    }
  };

  if (!authChecked) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading…</div>;
  if (!user) return <LoginPage onLogin={(u) => setUser(u)} />;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 18 }}>📁</span>
        <span style={{ fontWeight: 700, fontSize: 15, marginRight: 8 }}>Document Management</span>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400 }}>
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search documents and tags…"
            style={{ background: 'var(--surface2)' }}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {user.avatar}
          </div>
          <span style={{ fontSize: 13 }}>{user.name}</span>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { localStorage.removeItem('docs_token'); setUser(null); }}>Sign out</button>
        </div>
      </div>

      {/* Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '14px 10px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, padding: '0 8px', marginBottom: 8 }}>FOLDERS</div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelect={(id) => { setSelectedFolderId(id); setSearchQuery(''); }}
            onRefresh={loadData}
            currentUserId={user.id}
          />
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DocumentGrid
            documents={documents}
            folders={folders}
            allUsers={allUsers}
            currentUserId={user.id}
            selectedFolderId={selectedFolderId}
            onRefresh={loadData}
          />
        </div>
      </div>
    </div>
  );
}
