import { useState, useEffect } from 'react'
import { Skeleton } from '@mantine/core'
import { CopyButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconSearch, IconTrash, IconCopy, IconCheck,
  IconChevronDown, IconChevronUp, IconInbox,
  IconArrowLeft, IconX,
} from '@tabler/icons-react'
import { getHistory, deleteHistoryItem, clearHistory } from '../api'

const TONE_COLORS = {
  luxueux:       'var(--accent)',
  professionnel: '#3b82f6',
  technique:     '#64748b',
  minimaliste:   '#94a3b8',
  enthousiaste:  '#f59e0b',
  'décontracté': '#10b981',
}

const CATEGORIES = ['Tous', 'Mode', 'Tech', 'Beauté', 'Maison', 'Sport']

function HistoryRow({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const date = new Date(item.created_at).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })

  const toneColor = TONE_COLORS[item.tone] || '#94a3b8'
  const modelShort = item.model_used?.split('/')[1] || item.model_used || '—'

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        style={s.row}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Product */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.product_name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 380 }}>
            {item.generated_description?.slice(0, 100)}…
          </div>
        </div>

        {/* Tone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: toneColor, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>
            {item.tone || '—'}
          </span>
        </div>

        {/* Model */}
        <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
          {modelShort}
        </div>

        {/* Date */}
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{date}</div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
          <CopyButton value={item.generated_description} timeout={2000}>
            {({ copied, copy }) => (
              <button
                style={{ ...s.actionBtn, color: copied ? 'var(--accent)' : 'var(--muted)' }}
                onClick={() => {
                  copy()
                  notifications.show({ message: 'Description copiée !', color: 'teal', autoClose: 1500 })
                }}
                title="Copier"
              >
                {copied ? <IconCheck size={13} stroke={2} /> : <IconCopy size={13} stroke={1.8} />}
              </button>
            )}
          </CopyButton>
          <button
            style={{ ...s.actionBtn, color: 'var(--muted)' }}
            onClick={() => onDelete(item.id)}
            title="Supprimer"
          >
            <IconTrash size={13} stroke={1.8} />
          </button>
          <button style={{ ...s.actionBtn, color: 'var(--muted)' }} title={expanded ? 'Réduire' : 'Voir'}>
            {expanded
              ? <IconChevronUp size={13} stroke={1.8} />
              : <IconChevronDown size={13} stroke={1.8} />
            }
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={s.expandedBody}>
          {item.features && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--mono)', letterSpacing: 0.3 }}>CARACTÉRISTIQUES</span>
              {' · '}{item.features}
            </div>
          )}
          <div style={s.descBlock}>
            {item.generated_description}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            <span>{item.model_used}</span>
            <span>
              {item.language === 'fr' ? 'Français' : item.language === 'ar' ? 'Arabe' : 'English'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function History({ refreshTrigger, onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [confirmClear, setConfirmClear] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setItems(await getHistory(50)) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [refreshTrigger])

  const handleDelete = async (id) => {
    await deleteHistoryItem(id)
    setItems(p => p.filter(i => i.id !== id))
    notifications.show({ message: 'Description supprimée.', color: 'gray', autoClose: 1500 })
  }

  const handleClearAll = async () => {
    await clearHistory()
    setItems([])
    setConfirmClear(false)
    notifications.show({ message: 'Historique effacé.', color: 'orange', autoClose: 2000 })
  }

  const filtered = items.filter(i => {
    const matchSearch = !search ||
      i.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'Tous' ||
      (i.category || '').toLowerCase().includes(activeFilter.toLowerCase())
    return matchSearch && matchFilter
  })

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {onBack && (
            <button onClick={onBack} style={{ ...s.ghostBtn, padding: '6px 10px', marginTop: 4, color: 'var(--muted)' }}>
              <IconArrowLeft size={14} stroke={1.8} />
            </button>
          )}
          <div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.6, marginBottom: 4 }}>
              Historique
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              {items.length} description{items.length !== 1 ? 's' : ''} générée{items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {items.length > 0 && (
          confirmClear ? (
            <div style={s.confirmBox}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#c2410c' }}>Confirmer ?</span>
              <button style={{ ...s.ghostBtn, fontSize: 12, color: '#ef4444', borderColor: '#fecdd3' }} onClick={handleClearAll}>
                Oui, tout effacer
              </button>
              <button style={{ ...s.ghostBtn, fontSize: 12 }} onClick={() => setConfirmClear(false)}>
                Annuler
              </button>
            </div>
          ) : (
            <button style={s.ghostBtn} onClick={() => setConfirmClear(true)}>
              <IconTrash size={13} stroke={1.8} /> Tout effacer
            </button>
          )
        )}
      </div>

      {/* Search + filters */}
      {items.length > 0 && (
        <div style={s.searchRow}>
          <div style={s.searchInput}>
            <IconSearch size={15} stroke={1.8} color="var(--muted)" />
            <input
              placeholder="Rechercher un produit, une catégorie…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--fg)' }}
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch('')}>
                <IconX size={13} stroke={1.8} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {CATEGORIES.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  ...s.filterChip,
                  ...(activeFilter === f ? s.filterChipActive : {}),
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={s.table}>
          <div style={s.tableHeader}>
            <div>PRODUIT</div><div>TON</div><div>MODÈLE</div><div>DATE</div><div />
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: s.cols, gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton height={13} width="55%" radius={3} />
                <Skeleton height={11} width="80%" radius={3} />
              </div>
              <Skeleton height={11} width={60} radius={3} />
              <Skeleton height={11} width={80} radius={3} />
              <Skeleton height={11} width={70} radius={3} />
              <div />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={s.emptyState}>
          <IconInbox size={36} stroke={1.2} color="var(--muted)" />
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 16 }}>Aucune génération</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
            Vos descriptions générées apparaîtront ici.
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <IconSearch size={28} stroke={1.2} color="var(--muted)" />
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 14 }}>
            Aucun résultat pour «{search || activeFilter}»
          </div>
        </div>
      ) : (
        <div style={s.table}>
          <div style={s.tableHeader}>
            <div>PRODUIT</div>
            <div>TON</div>
            <div>MODÈLE</div>
            <div>DATE</div>
            <div style={{ textAlign: 'right' }}>ACTIONS</div>
          </div>
          {filtered.map(item => (
            <HistoryRow key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

const cols = '2.5fr 1fr 1fr 1fr 110px'

const s = {
  cols,
  page: { flex: 1, overflowY: 'auto', padding: '40px 56px' },
  pageHeader: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28,
  },
  searchRow: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap',
  },
  searchInput: {
    display: 'flex', alignItems: 'center', gap: 10,
    flex: 1, minWidth: 260,
    padding: '11px 16px', border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--bg)',
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--muted)', display: 'flex', padding: 0,
  },
  filterChip: {
    fontSize: 12, padding: '6px 12px', borderRadius: 6,
    background: 'transparent', color: 'var(--muted)',
    border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit',
  },
  filterChipActive: {
    background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)',
  },
  table: {
    border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid', gridTemplateColumns: cols,
    padding: '10px 20px', gap: 16,
    background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: 'var(--muted)',
    fontFamily: 'var(--mono)',
  },
  row: {
    display: 'grid', gridTemplateColumns: cols,
    padding: '14px 20px', gap: 16, alignItems: 'center',
    cursor: 'pointer', fontSize: 13,
  },
  actionBtn: {
    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4,
  },
  expandedBody: {
    padding: '16px 20px 20px',
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
  },
  descBlock: {
    padding: '14px 16px',
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
    fontSize: 13, lineHeight: 1.75, color: 'var(--fg)',
    whiteSpace: 'pre-wrap',
  },
  ghostBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', background: 'transparent', color: 'var(--fg)',
    border: '1px solid var(--border)', borderRadius: 6,
    fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  confirmBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: '#fff7ed',
    border: '1px solid #fed7aa', borderRadius: 8,
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', textAlign: 'center',
  },
}
