import { useState, useEffect } from 'react'
import { Skeleton } from '@mantine/core'
import { IconWand, IconSparkles, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { getModels, generateDescription } from '../api'


const CATEGORIES = [
  'Mode & Vêtements', 'Électronique & Tech', 'Maison & Décoration',
  'Beauté & Cosmétiques', 'Sport & Fitness', 'Alimentation & Boissons',
  'Jouets & Enfants', 'Livres & Culture', 'Automotive', 'Autre',
]

const FALLBACK_MODELS = [
  { id: 'openai/gpt-4o-mini',             label: 'GPT-4o mini' },
  { id: 'anthropic/claude-haiku-20240307', label: 'Claude Haiku 3.5' },
  { id: 'mistralai/mistral-large',         label: 'Mistral Large' },
]

export default function ProductForm({ onResult, isLoading, setIsLoading }) {
  const [models, setModels] = useState([])
  const [showOptions, setShowOptions] = useState(false)
  const [form, setForm] = useState({
    productName: '',
    category: '',
    features: '',
    targetAudience: '',
    language: 'fr',
    model: 'openai/gpt-4o-mini',
    extraInstructions: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    getModels()
      .then(setModels)
      .catch(() => setModels(FALLBACK_MODELS))
  }, [])

  const set = (field) => (e) => {
    const val = typeof e === 'string' ? e : (e.target?.value ?? e)
    setForm(p => ({ ...p, [field]: val }))
    if (error) setError('')
  }

  const handleSubmit = async () => {
    if (!form.productName.trim()) { setError('Le nom du produit est requis.'); return }
    setIsLoading(true)
    setError('')
    try {
      onResult(await generateDescription(form))
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de génération. Vérifiez votre clé API.')
    } finally {
      setIsLoading(false)
    }
  }

  const activeModels = models.length > 0 ? models : FALLBACK_MODELS

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <IconWand size={14} stroke={1.8} />
        <span>Paramètres</span>
      </div>

      <div style={s.body}>

        {/* Product name */}
        <div>
          <label style={s.label}>Nom du produit *</label>
          <input
            style={{ ...s.input, ...(error && !form.productName ? { borderColor: '#ef4444' } : {}) }}
            placeholder="Ex: Sac à main en cuir Milano"
            value={form.productName}
            onChange={set('productName')}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Submit button — prominent, right after required field */}
        {error && (
          <div style={{ padding: '9px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 5, fontSize: 12, color: '#be123c' }}>
            {error}
          </div>
        )}

        <button
          style={{ ...s.submitBtn, opacity: isLoading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading
            ? <><span style={s.spinner} /> Génération en cours…</>
            : <><IconSparkles size={14} stroke={1.8} /> Générer la description</>
          }
        </button>

        {/* Collapse toggle */}
        <button style={s.collapseToggle} onClick={() => setShowOptions(v => !v)}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', letterSpacing: 0.3 }}>
            OPTIONS AVANCÉES
          </span>
          {showOptions
            ? <IconChevronUp  size={13} stroke={1.8} color="var(--muted)" />
            : <IconChevronDown size={13} stroke={1.8} color="var(--muted)" />
          }
        </button>

        {/* Collapsible optional criteria */}
        {showOptions && (
          <div style={s.optionsPanel}>

            {/* Category + Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={s.label}>Catégorie</label>
                <select style={s.input} value={form.category} onChange={set('category')}>
                  <option value="">Choisir…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Langue</label>
                <select style={s.input} value={form.language} onChange={set('language')}>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="ar">🇲🇦 Arabe</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label style={s.label}>Caractéristiques clés</label>
              <textarea
                rows={3}
                style={{ ...s.input, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Ex: Cuir véritable, fermeture dorée, 3 compartiments…"
                value={form.features}
                onChange={set('features')}
              />
            </div>

            {/* Audience */}
            <div>
              <label style={s.label}>Audience cible</label>
              <input
                style={s.input}
                placeholder="Ex: Femmes 25–45, urbaines"
                value={form.targetAudience}
                onChange={set('targetAudience')}
              />
            </div>


            {/* Model */}
            <div>
              <label style={s.label}>Modèle</label>
              {models.length === 0 && FALLBACK_MODELS.length === 0 ? (
                <Skeleton height={32} radius={5} />
              ) : (
                <select style={s.input} value={form.model} onChange={set('model')}>
                  {activeModels.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Extra instructions */}
            <div>
              <label style={s.label}>Instructions supplémentaires</label>
              <input
                style={s.input}
                placeholder="Ex: Max 150 mots, axer sur l'éco-responsabilité…"
                value={form.extraInstructions}
                onChange={set('extraInstructions')}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  card: {
    border: '1px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 18px', borderBottom: '1px solid var(--border)',
    fontSize: 12, fontWeight: 600, background: 'var(--bg-2)',
  },
  body: { padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' },
  label: {
    display: 'block', fontSize: 11, fontWeight: 500,
    color: 'var(--muted)', marginBottom: 5, letterSpacing: 0.3,
  },
  input: {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: 5,
    background: 'var(--bg)', color: 'var(--fg)',
    fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    width: '100%', padding: '11px',
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  collapseToggle: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '8px 12px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
  },
  optionsPanel: {
    display: 'flex', flexDirection: 'column', gap: 14,
    padding: '14px 12px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 6,
  },
  spinner: {
    width: 13, height: 13, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
    animation: 'spin 0.7s linear infinite', flexShrink: 0,
  },
}
