import { Skeleton } from '@mantine/core'
import { CopyButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconFileText, IconCopy, IconCheck, IconRefresh, IconSparkles, IconPhoto,
} from '@tabler/icons-react'

function LoadingSkeleton({ isMobile }) {
  const cardStyle = isMobile ? { ...s.card, flex: 'none', overflow: 'visible' } : s.card
  return (
    <div style={cardStyle}>
      <div style={s.header}>
        <Skeleton height={11} width={70} radius={3} />
        <Skeleton height={18} width={52} radius={3} />
      </div>
      <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[95, 80, 100, 70, 88, 60, 75, 50].map((w, i) => (
          <Skeleton key={i} height={13} width={`${w}%`} radius={3} />
        ))}
      </div>
      <div style={s.footer}>
        <Skeleton height={11} width={60} radius={3} />
      </div>
    </div>
  )
}

function EmptyState({ isMobile }) {
  const cardStyle = isMobile ? { ...s.card, flex: 'none' } : s.card
  return (
    <div style={cardStyle}>
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <IconSparkles size={14} stroke={1.8} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Résultat</span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <div style={s.emptyIcon}>
          <IconFileText size={26} stroke={1.5} color="var(--muted)" />
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Prêt à générer</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 280 }}>
          Renseignez les informations du produit et cliquez sur{' '}
          <span style={{ fontWeight: 600, color: 'var(--fg)' }}>Générer</span>.
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Multilingue', 'SEO-friendly', 'Personnalisable', 'Instant'].map(t => (
            <span key={t} style={s.chip}>{t}</span>
          ))}
        </div>
      </div>
      <div style={s.footer}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>—</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
          <IconSparkles size={11} stroke={1.8} />
        </div>
      </div>
    </div>
  )
}

function RenderDescription({ text }) {
  const lines = text.split('\n')
  const elements = []

  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) { elements.push(<div key={i} style={{ height: 6 }} />); return }

    const parseBold = (str) => str.split(/\*\*(.*?)\*\*/g).map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : p
    )

    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 2 }}>
          {parseBold(line.slice(3))}
        </div>
      )
      return
    }
    if (line.startsWith('### ')) {
      elements.push(
        <div key={i} style={{ fontWeight: 600, fontSize: 14, marginTop: 10, marginBottom: 2 }}>
          {parseBold(line.slice(4))}
        </div>
      )
      return
    }

    const bullet = line.match(/^[-•*]\s+(.+)/)
    if (bullet) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingLeft: 6 }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
            flexShrink: 0, marginTop: 8,
          }} />
          <span style={{ fontSize: 14, lineHeight: 1.75 }}>{parseBold(bullet[1])}</span>
        </div>
      )
      return
    }

    const num = line.match(/^(\d+)\.\s+(.+)/)
    if (num) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingLeft: 6 }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginTop: 4, width: 18, flexShrink: 0, textAlign: 'right' }}>
            {num[1]}.
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.75 }}>{parseBold(num[2])}</span>
        </div>
      )
      return
    }

    elements.push(
      <p key={i} style={{ fontSize: 14, lineHeight: 1.75, margin: 0 }}>
        {parseBold(line)}
      </p>
    )
  })

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{elements}</div>
}

export default function DescriptionResult({ result, isLoading, imageLoading, isMobile }) {
  if (isLoading) return <LoadingSkeleton isMobile={isMobile} />
  if (!result)   return <EmptyState isMobile={isMobile} />

  const cardStyle = isMobile
    ? { ...s.card, flex: 'none', overflow: 'visible' }
    : s.card

  return (
    <div style={cardStyle} className="fade-in">
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <IconSparkles size={14} stroke={1.8} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Résultat</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <CopyButton value={result.description} timeout={2500}>
            {({ copied, copy }) => (
              <button
                style={s.iconBtn}
                title={copied ? 'Copié !' : 'Copier'}
                onClick={() => {
                  copy()
                  if (!copied) notifications.show({
                    message: 'Description copiée !',
                    color: 'teal',
                    icon: <IconCheck size={14} />,
                    autoClose: 2000,
                  })
                }}
              >
                {copied ? <IconCheck size={13} stroke={2} /> : <IconCopy size={13} stroke={1.8} />}
              </button>
            )}
          </CopyButton>
        </div>
      </div>

      {/* Image section */}
      {(imageLoading || result.imageUrl) && (
        <div style={s.imageSection}>
          {imageLoading && !result.imageUrl ? (
            <div style={s.imagePlaceholder}>
              <div style={s.imageSpinner} />
              <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Génération de l'image…</span>
            </div>
          ) : (
            <img
              src={result.imageUrl}
              alt="Produit généré"
              style={s.productImage}
              className="fade-in"
            />
          )}
        </div>
      )}

      <div style={{ padding: '20px 24px 28px', ...(isMobile ? {} : { flex: 1, overflowY: 'auto' }) }}>
        <RenderDescription text={result.description} />
      </div>

      <div style={s.footer}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
          {result.language === 'fr' ? 'Français' : result.language === 'ar' ? 'Arabe' : 'English'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
          <IconSparkles size={11} stroke={1.8} />
        </div>
      </div>
    </div>
  )
}

const s = {
  card: {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
    overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1,
  },
  header: {
    padding: '12px 18px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-2)',
  },
  footer: {
    padding: '12px 24px', borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--bg-2)',
  },
  mono11: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: 1 },
  emptyIcon: {
    width: 60, height: 60, borderRadius: '50%',
    background: 'var(--surface)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  chip: {
    fontSize: 11, padding: '4px 10px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 20, color: 'var(--muted)',
  },
  iconBtn: {
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', color: 'var(--muted)',
    border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer',
  },
  imageSection: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: 200,
  },
  imagePlaceholder: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  imageSpinner: {
    width: 28, height: 28, borderRadius: '50%',
    border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
    animation: 'spin 0.8s linear infinite',
  },
  productImage: {
    width: '100%', maxHeight: 280,
    objectFit: 'contain', display: 'block',
    padding: '12px',
  },
  ghostBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', background: 'transparent', color: 'var(--fg)',
    border: '1px solid var(--border)', borderRadius: 6,
    fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  ghostBtnCopied: {
    background: 'var(--accent-soft)', color: 'var(--accent-strong)', borderColor: 'var(--accent-soft)',
  },
}
