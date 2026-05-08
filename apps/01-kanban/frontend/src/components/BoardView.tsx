import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay, closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Board, Card, Column, User } from '../types';
import { api } from '../api';
import { useKanbanSocket } from '../useKanbanSocket';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import CardDetailModal from './CardDetailModal';

interface Props {
  boardId: string;
  currentUser: User;
  onLogout: () => void;
}

export default function BoardView({ boardId, currentUser, onLogout }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadBoard = useCallback(async () => {
    try {
      const [b, u] = await Promise.all([api.getBoard(boardId), api.getUsers()]);
      setBoard(b);
      setUsers(u);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  // Real-time WebSocket updates
  useKanbanSocket(useCallback((event) => {
    if (!board) return;
    const { type, payload } = event as { type: string; payload: Record<string, unknown> };

    setBoard((prev) => {
      if (!prev) return prev;

      if (type === 'card:created') {
        const card = payload as unknown as Card;
        return { ...prev, columns: prev.columns.map((col) =>
          col.id === card.columnId ? { ...col, cards: [...col.cards, card].sort((a, b) => a.order - b.order) } : col
        )};
      }

      if (type === 'card:updated') {
        const card = payload as unknown as Card;
        return { ...prev, columns: prev.columns.map((col) => ({
          ...col, cards: col.cards.map((c) => c.id === card.id ? card : c),
        }))};
      }

      if (type === 'card:deleted') {
        const { id, columnId } = payload as { id: string; columnId: string };
        return { ...prev, columns: prev.columns.map((col) =>
          col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== id) } : col
        )};
      }

      if (type === 'card:moved') {
        const { cardId, fromColumnId, toColumnId } = payload as { cardId: string; fromColumnId: string; toColumnId: string; order: number };
        let movedCard: Card | undefined;
        const cols = prev.columns.map((col) => {
          if (col.id === fromColumnId) {
            const c = col.cards.find((c) => c.id === cardId);
            if (c) movedCard = { ...c, columnId: toColumnId };
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
          }
          return col;
        });
        if (movedCard) {
          return { ...prev, columns: cols.map((col) =>
            col.id === toColumnId ? { ...col, cards: [...col.cards, movedCard!] } : col
          )};
        }
        return prev;
      }

      if (type === 'column:created') {
        const col = payload as unknown as Column;
        return { ...prev, columns: [...prev.columns, { ...col, cards: [] }].sort((a, b) => a.order - b.order) };
      }

      if (type === 'column:deleted') {
        return { ...prev, columns: prev.columns.filter((c) => c.id !== (payload as { id: string }).id) };
      }

      return prev;
    });
  }, [board]));

  // ── DnD handlers ─────────────────────────────────────────────────────────
  const findCard = (id: string): Card | undefined => {
    return board?.columns.flatMap((c) => c.cards).find((c) => c.id === id);
  };
  const findColumnOfCard = (cardId: string): Column | undefined => {
    return board?.columns.find((col) => col.cards.some((c) => c.id === cardId));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCard(findCard(active.id as string) ?? null);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !board) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnOfCard(activeId);
    const overCol = board.columns.find((c) => c.id === overId) ?? findColumnOfCard(overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    setBoard((prev) => {
      if (!prev) return prev;
      let movedCard: Card | undefined;
      const cols = prev.columns.map((col) => {
        if (col.id === activeCol.id) {
          movedCard = col.cards.find((c) => c.id === activeId);
          return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
        }
        return col;
      });
      if (!movedCard) return prev;
      movedCard = { ...movedCard, columnId: overCol.id };
      return { ...prev, columns: cols.map((col) =>
        col.id === overCol.id ? { ...col, cards: [...col.cards, movedCard!] } : col
      )};
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeCol = findColumnOfCard(activeId);
    const overCol = board.columns.find((c) => c.id === overId) ?? findColumnOfCard(overId);

    if (!activeCol || !overCol) return;

    if (activeCol.id === overCol.id) {
      // Reorder within same column
      const oldIdx = activeCol.cards.findIndex((c) => c.id === activeId);
      const newIdx = overCol.cards.findIndex((c) => c.id === overId);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(activeCol.cards, oldIdx, newIdx);
        setBoard((prev) => prev ? { ...prev, columns: prev.columns.map((col) =>
          col.id === activeCol.id ? { ...col, cards: reordered } : col
        )} : prev);
        reordered.forEach((c, i) => api.updateCard(c.id, { order: i }).catch(console.error));
      }
    } else {
      // Move to different column — already done optimistically in handleDragOver
      const targetCards = overCol.cards;
      const newOrder = targetCards.findIndex((c) => c.id === activeId);
      await api.updateCard(activeId, { columnId: overCol.id, order: newOrder >= 0 ? newOrder : targetCards.length }).catch(console.error);
    }
  };

  // ── Card mutations ────────────────────────────────────────────────────────
  const handleAddCard = async (columnId: string, title: string) => {
    if (!board) return;
    try {
      const card = await api.createCard({ columnId, boardId: board.id, title });
      setBoard((prev) => prev ? { ...prev, columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
      )} : prev);
    } catch (err) { console.error(err); }
  };

  const handleCardUpdate = (updated: Card) => {
    setBoard((prev) => prev ? { ...prev, columns: prev.columns.map((col) => ({
      ...col, cards: col.cards.map((c) => c.id === updated.id ? updated : c),
    }))} : prev);
    setSelectedCard(null);
  };

  const handleCardDelete = (cardId: string) => {
    setBoard((prev) => prev ? { ...prev, columns: prev.columns.map((col) => ({
      ...col, cards: col.cards.filter((c) => c.id !== cardId),
    }))} : prev);
  };

  const handleAddColumn = async () => {
    if (!board || !newColTitle.trim()) return;
    try {
      const col = await api.createColumn(board.id, newColTitle.trim());
      setBoard((prev) => prev ? { ...prev, columns: [...prev.columns, { ...col, cards: [] }] } : prev);
      setNewColTitle('');
      setAddingColumn(false);
    } catch (err) { console.error(err); }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Delete this column? Cards will be moved to the first column.')) return;
    await api.deleteColumn(columnId);
    setBoard((prev) => prev ? { ...prev, columns: prev.columns.filter((c) => c.id !== columnId) } : prev);
  };

  const handleRenameColumn = async (columnId: string, title: string) => {
    const col = await api.updateColumn(columnId, { title });
    setBoard((prev) => prev ? { ...prev, columns: prev.columns.map((c) => c.id === columnId ? { ...c, ...col } : c) } : prev);
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
      Loading board…
    </div>
  );
  if (!board) return <div style={{ padding: 40, color: 'var(--danger)' }}>Failed to load board.</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🟣</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{board.title}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>{board.description}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: -4 }}>
            {board.members.map((m) => (
              <div
                key={m.id}
                title={m.name}
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', marginLeft: -6 }}
              >
                {m.avatar}
              </div>
            ))}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{currentUser.name}</span>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>Sign out</button>
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {board.columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              users={users}
              onCardClick={setSelectedCard}
              onAddCard={handleAddCard}
              onDeleteColumn={handleDeleteColumn}
              onRenameColumn={handleRenameColumn}
            />
          ))}

          {/* Add column */}
          {addingColumn ? (
            <div style={{ width: 260, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, flexShrink: 0 }}>
              <input
                autoFocus
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                placeholder="Column name…"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setAddingColumn(false); }}
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddColumn} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>Add</button>
                <button onClick={() => setAddingColumn(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              style={{ width: 260, flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border)', color: 'var(--text-muted)', borderRadius: 10, padding: '14px 0', fontSize: 14, cursor: 'pointer' }}
            >
              + Add column
            </button>
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} users={users} isDragging={false} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          columns={board.columns}
          users={users}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </div>
  );
}
