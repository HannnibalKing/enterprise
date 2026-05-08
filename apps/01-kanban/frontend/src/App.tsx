import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import BoardView from './components/BoardView';
import { User } from './types';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('kanban_token');
    if (token) {
      api.me()
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem('kanban_token'))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  if (!authChecked) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
      Authenticating…
    </div>
  );

  if (!user) return (
    <LoginPage onLogin={(_, u) => setUser(u)} />
  );

  return (
    <BoardView
      boardId="board-main"
      currentUser={user}
      onLogout={() => {
        localStorage.removeItem('kanban_token');
        setUser(null);
      }}
    />
  );
}
