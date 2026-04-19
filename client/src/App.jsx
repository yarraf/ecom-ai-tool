import { useState, useEffect } from 'react'
import {
  IconWand, IconHistory, IconMail, IconSearch,
  IconChartBar, IconMessageChatbot, IconSettings,
  IconPlus, IconSun, IconMoon,
} from '@tabler/icons-react'
import ProductForm from './components/ProductForm'
import DescriptionResult from './components/DescriptionResult'
import History from './components/History'
import { getStats } from './api'
import './index.css'

const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev'

const NAV_ICONS = [
  { id: 'generator', Icon: IconWand },
  { id: 'history',   Icon: IconHistory },
  { id: 'marketing', Icon: IconMail,           soon: true },
  { id: 'seo',       Icon: IconSearch,         soon: true },
  { id: 'reviews',   Icon: IconChartBar,       soon: true },
  { id: 'chatbot',   Icon: IconMessageChatbot, soon: true },
]

const ACCENTS = [
  { id: 'forest',  color: 'oklch(62% 0.14 155)' },
  { id: 'cobalt',  color: 'oklch(58% 0.14 255)' },
  { id: 'amber',   color: 'oklch(68% 0.14 60)'  },
  { id: 'crimson', color: 'oklch(58% 0.14 25)'  },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

/* ─── Desktop sidebar ─── */
function Sidebar({ page, onNavigate, theme, onToggleTheme, accent, onSetAccent }) {
  return (
    <aside style={s.sidebar}>
      <div style={s.brandMark} title={`E-Commerce AI · ${APP_VERSION}`}>E</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 20, flex: 1 }}>
        {NAV_ICONS.map(({ id, Icon, soon }) => (
          <button
            key={id}
            onClick={() => !soon && onNavigate(id)}
            title={id}
            style={{
              ...s.iconBtn,
              background: page === id ? 'var(--surface)' : 'transparent',
              color: page === id ? 'var(--fg)' : 'var(--muted)',
              opacity: soon ? 0.4 : 1,
              cursor: soon ? 'default' : 'pointer',
            }}
          >
            <Icon size={17} stroke={1.8} />
          </button>
        ))}
      </div>

      <div style={s.accentGrid}>
        {ACCENTS.map(a => (
          <button
            key={a.id}
            onClick={() => onSetAccent(a.id)}
            title={a.id}
            style={{
              width: 16, height: 16, borderRadius: '50%',
              background: a.color, border: 'none', cursor: 'pointer', padding: 0,
              outline: accent === a.id ? '2px solid var(--fg)' : '2px solid transparent',
              outlineOffset: 1,
            }}
          />
        ))}
      </div>

      <button
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        style={{ ...s.iconBtn, color: 'var(--muted)', cursor: 'pointer', marginTop: 4 }}
      >
        {theme === 'dark' ? <IconSun size={16} stroke={1.8} /> : <IconMoon size={16} stroke={1.8} />}
      </button>

      <button style={{ ...s.iconBtn, color: 'var(--muted)', cursor: 'default', opacity: 0.45, marginTop: 2 }}>
        <IconSettings size={16} stroke={1.8} />
      </button>
    </aside>
  )
}

/* ─── Mobile top header ─── */
function MobileHeader({ page, onNavigate, theme, onToggleTheme, accent, onSetAccent }) {
  const [showAccents, setShowAccents] = useState(false)
  return (
    <header style={s.mobileHeader}>
      <div style={s.brandMark} title={`E-Commerce AI · ${APP_VERSION}`}>E</div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
        {NAV_ICONS.filter(n => !n.soon).map(({ id, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              ...s.iconBtn,
              background: page === id ? 'var(--surface)' : 'transparent',
              color: page === id ? 'var(--fg)' : 'var(--muted)',
            }}
          >
            <Icon size={18} stroke={1.8} />
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Accent picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAccents(v => !v)}
            style={{
              width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              background: ACCENTS.find(a => a.id === accent)?.color ?? 'var(--accent)',
              outline: '2px solid var(--border)', outlineOffset: 1,
            }}
          />
          {showAccents && (
            <div style={{ position: 'absolute', right: 0, top: 28, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, zIndex: 50 }}>
              {ACCENTS.map(a => (
                <button
                  key={a.id}
                  onClick={() => { onSetAccent(a.id); setShowAccents(false) }}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', background: a.color,
                    border: 'none', cursor: 'pointer', padding: 0,
                    outline: accent === a.id ? '2px solid var(--fg)' : '2px solid transparent',
                    outlineOffset: 1,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onToggleTheme}
          style={{ ...s.iconBtn, color: 'var(--muted)', cursor: 'pointer' }}
        >
          {theme === 'dark' ? <IconSun size={16} stroke={1.8} /> : <IconMoon size={16} stroke={1.8} />}
        </button>
      </div>
    </header>
  )
}

/* ─── Stats strip ─── */
const LANG_LABELS = { fr: 'FR', en: 'EN', ar: 'AR' }

function StatsStrip({ stats: data, isMobile }) {
  const topLang = data?.topLanguage ? (LANG_LABELS[data.topLanguage] ?? data.topLanguage.toUpperCase()) : '—'

  const stats = [
    { label: "Aujourd'hui", value: data?.today ?? '—', sub: 'générations du jour'  },
    { label: 'Total',       value: data?.total ?? '—', sub: 'descriptions générées'},
    { label: 'Langue top',  value: topLang,             sub: 'la plus utilisée'     },
    { label: 'Langues',     value: '3',                 sub: 'FR · EN · AR'         },
  ]

  return (
    <div style={{
      ...s.statsStrip,
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    }}>
      {stats.map(({ label, value, sub }) => (
        <div key={label} style={s.statCard}>
          <div style={s.statLabel}>{label}</div>
          <div style={{ ...s.statValue, fontSize: isMobile ? 20 : 24 }}>{value}</div>
          <div style={s.statSub}>{sub}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── App ─── */
export default function App() {
  const isMobile = useIsMobile()
  const [page, setPage]           = useState('generator')
  const [result, setResult]       = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [formKey, setFormKey]     = useState(0)
  const [appStats, setAppStats]   = useState(null)
  const [theme,  setTheme]  = useState(() => localStorage.getItem('theme')  || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') || 'amber')

  useEffect(() => {
    getStats().then(setAppStats).catch(() => {})
  }, [historyKey])

  const toggleTheme    = () => setTheme(t => { const n = t === 'dark' ? 'light' : 'dark'; localStorage.setItem('theme', n); return n })
  const handleSetAccent = (a) => { setAccent(a); localStorage.setItem('accent', a) }
  const handleResult   = (data) => { setResult(data); setHistoryKey(k => k + 1) }
  const handleNew      = () => { setResult(null); setFormKey(k => k + 1) }

  const navProps = { page, onNavigate: setPage, theme, onToggleTheme: toggleTheme, accent, onSetAccent: handleSetAccent }

  return (
    <div data-theme={theme} data-accent={accent} style={s.root}>

      {!isMobile && <Sidebar {...navProps} />}

      <div style={s.shell}>
        {isMobile && <MobileHeader {...navProps} />}

        <main style={s.main}>

          {page === 'generator' && (<>
            {/* Topbar */}
            <div style={{ ...s.topbar, padding: isMobile ? '14px 16px' : '18px 28px' }}>
              <div>
                <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, letterSpacing: -0.3 }}>
                  Descriptions produits
                </div>
                {!isMobile && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Générateur de descriptions
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={s.ghostBtn} onClick={() => setPage('history')}>
                  <IconHistory size={13} stroke={1.8} />
                  {!isMobile && ' Historique'}
                </button>
                <button style={s.primaryBtn} onClick={handleNew}>
                  <IconPlus size={13} stroke={2} />
                  {!isMobile && ' Nouveau'}
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{
              ...s.body,
              flexDirection: isMobile ? 'column' : 'row',
              padding: isMobile ? '16px' : '20px 28px',
              overflowY: isMobile ? 'auto' : 'hidden',
            }}>
              {isMobile ? (
                /* Mobile: stacked */
                <>
                  <StatsStrip stats={appStats} isMobile />
                  <ProductForm key={formKey} onResult={handleResult} isLoading={isLoading} setIsLoading={setIsLoading} />
                  <DescriptionResult result={result} isLoading={isLoading} />
                </>
              ) : (
                /* Desktop: two panes */
                <>
                  <div style={s.leftPane}>
                    <ProductForm key={formKey} onResult={handleResult} isLoading={isLoading} setIsLoading={setIsLoading} />
                  </div>
                  <div style={s.rightPane}>
                    <StatsStrip stats={appStats} isMobile={false} />
                    <DescriptionResult result={result} isLoading={isLoading} />
                  </div>
                </>
              )}
            </div>
          </>)}

          {page === 'history' && (
            <History refreshTrigger={historyKey} onBack={() => setPage('generator')} />
          )}

        </main>
      </div>
    </div>
  )
}

const s = {
  root: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    background: 'var(--bg)', color: 'var(--fg)',
  },
  shell: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0,
  },
  mobileHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderBottom: '1px solid var(--border)',
    background: 'var(--bg)', flexShrink: 0,
  },
  sidebar: {
    width: 56, padding: '16px 10px',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'var(--bg)', flexShrink: 0,
  },
  brandMark: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--fg)', color: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 15, flexShrink: 0,
    fontFamily: 'var(--mono)',
  },
  iconBtn: {
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', borderRadius: 6, background: 'transparent',
  },
  accentGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 5, padding: '8px 2px',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  topbar: {
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0, background: 'var(--bg)',
  },
  ghostBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
    background: 'transparent', color: 'var(--fg)',
    border: '1px solid var(--border)', borderRadius: 6,
    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
    background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6,
    fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  body: {
    flex: 1, minHeight: 0,
    display: 'flex', gap: 16, overflow: 'hidden',
  },
  leftPane: {
    width: 380, flexShrink: 0,
    display: 'flex', flexDirection: 'column', minHeight: 0,
  },
  rightPane: {
    flex: 1, minHeight: 0,
    display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
  },
  statsStrip: {
    display: 'grid', gap: 10, flexShrink: 0,
  },
  statCard: {
    padding: '12px 14px', border: '1px solid var(--border)',
    borderRadius: 8, background: 'var(--bg)',
  },
  statLabel: {
    fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
    letterSpacing: 0.6, fontFamily: 'var(--mono)',
  },
  statValue: { fontWeight: 600, letterSpacing: -0.5, marginTop: 4 },
  statSub:   { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
}
