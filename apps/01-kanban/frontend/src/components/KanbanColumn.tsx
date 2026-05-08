import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Card, User } from '../types';
import KanbanCard from './KanbanCard';

interface SortableCardProps {
  card: Card;
  users: User[];
  onCardClick: (card: Card) => void;
}

function SortableCard({ card, users, onCardClick }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard card={card} users={users} isDragging={isDragging} onClick={() => onCardClick(card)} />
    </div>
  );
}

interface Props {
  column: Column;
  users: User[];
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
}

export default function KanbanColumn({ column, users, onCardClick, onAddCard, onDeleteColumn, onRenameColumn }: Props) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });

  const cardIds = column.cards.map((c) => c.id);
  const wipExceeded = column.wipLimit !== null && column.cards.length > column.wipLimit;

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setAddingCard(false);
    }
  };

  const handleRename = () => {
    if (titleInput.trim() && titleInput !== column.title) {
      onRenameColumn(column.id, titleInput.trim());
    }
    setEditingTitle(false);
  };

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? '#1a2642' : 'var(--surface)',
        border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 10,
        maxHeight: 'calc(100vh - 120px)',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Column header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: column.color, flexShrink: 0 }} />
            {editingTitle ? (
              <input
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingTitle(false); }}
                style={{ padding: '2px 6px', fontSize: 13, fontWeight: 600 }}
              />
            ) : (
              <span
                onDoubleClick={() => setEditingTitle(true)}
                style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {column.title}
              </span>
            )}
            <span style={{
              marginLeft: 2, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 9,
              background: wipExceeded ? 'rgba(248,113,113,0.15)' : 'rgba(148,163,184,0.15)',
              color: wipExceeded ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              {column.cards.length}{column.wipLimit ? `/${column.wipLimit}` : ''}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setAddingCard(true)}
              title="Add card"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '2px 6px', borderRadius: 4 }}
            >
              +
            </button>
            <button
              onClick={() => onDeleteColumn(column.id)}
              title="Delete column"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, padding: '2px 6px', borderRadius: 4 }}
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Cards area */}
      <div
        ref={setDropRef}
        style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 6px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} users={users} onCardClick={onCardClick} />
          ))}
        </SortableContext>

        {/* Quick-add form */}
        {addingCard ? (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Card title…"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); } if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle(''); } }}
              style={{ marginBottom: 8, fontSize: 13, minHeight: 60 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleAddCard}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}
              >
                Add
              </button>
              <button
                onClick={() => { setAddingCard(false); setNewCardTitle(''); }}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            style={{
              background: 'none', border: '1px dashed var(--border)', color: 'var(--text-muted)',
              borderRadius: 8, padding: '8px 0', fontSize: 13, width: '100%', textAlign: 'center',
            }}
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}
