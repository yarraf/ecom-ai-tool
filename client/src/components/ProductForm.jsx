import { useState, useEffect } from 'react'
import {
  Paper, TextInput, Textarea, Select, Button, Stack,
  Group, Text, Box, Divider, SegmentedControl, Loader,
  ThemeIcon, Badge,
} from '@mantine/core'
import {
  IconPackage, IconTag, IconUsers, IconMessageCircle,
  IconGlobe, IconCpu, IconNotes, IconSparkles, IconAlertCircle,
} from '@tabler/icons-react'
import { getModels, generateDescription } from '../api'

const TONES = [
  { value: 'professionnel',  label: 'Professionnel' },
  { value: 'luxueux',        label: 'Luxueux & Premium' },
  { value: 'décontracté',   label: 'Décontracté' },
  { value: 'technique',      label: 'Technique' },
  { value: 'minimaliste',    label: 'Minimaliste' },
  { value: 'enthousiaste',   label: 'Enthousiaste' },
]

const CATEGORIES = [
  'Mode & Vêtements', 'Électronique & Tech', 'Maison & Décoration',
  'Beauté & Cosmétiques', 'Sport & Fitness', 'Alimentation & Boissons',
  'Jouets & Enfants', 'Livres & Culture', 'Automotive', 'Autre',
]

function SectionLabel({ icon: Icon, label, optional }) {
  return (
    <Group gap={6} mb={6}>
      <ThemeIcon size={18} radius="sm" variant="light" color="violet">
        <Icon size={11} />
      </ThemeIcon>
      <Text size="xs" fw={600} c="#374151" tt="uppercase" ls={0.5}>{label}</Text>
      {optional && <Badge size="xs" variant="outline" color="gray" radius="sm">optionnel</Badge>}
    </Group>
  )
}

export default function ProductForm({ onResult, isLoading, setIsLoading }) {
  const [models, setModels] = useState([])
  const [form, setForm] = useState({
    productName: '',
    category: '',
    features: '',
    targetAudience: '',
    tone: 'professionnel',
    language: 'fr',
    model: 'openai/gpt-4o-mini',
    extraInstructions: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    getModels().then(setModels).catch(() => {})
  }, [])

  const set = (field) => (val) => {
    setForm(p => ({ ...p, [field]: typeof val === 'string' ? val : val.target?.value ?? val }))
    if (error) setError('')
  }

  const handleSubmit = async () => {
    if (!form.productName.trim()) { setError('Le nom du produit est requis.'); return }
    setIsLoading(true)
    setError('')
    try {
      const result = await generateDescription(form)
      onResult(result)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de génération. Vérifiez votre clé API.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Paper shadow="xs" p="xl" withBorder style={{ borderColor: '#e5e7eb' }}>
      {/* Header */}
      <Group gap="sm" mb="lg">
        <ThemeIcon size={36} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
          <IconSparkles size={18} />
        </ThemeIcon>
        <Box>
          <Text fw={700} size="sm" c="#111827">Paramètres du produit</Text>
          <Text size="xs" c="dimmed">Renseignez les informations pour générer</Text>
        </Box>
      </Group>

      <Stack gap="md">
        {/* Product name */}
        <Box>
          <SectionLabel icon={IconPackage} label="Nom du produit" />
          <TextInput
            placeholder="Ex: Sac à main en cuir Milano"
            value={form.productName}
            onChange={set('productName')}
            error={error && !form.productName ? error : null}
            size="md"
            styles={{ input: { borderColor: '#d1d5db', '&:focus': { borderColor: '#7c3aed' } } }}
          />
        </Box>

        {/* Category */}
        <Box>
          <SectionLabel icon={IconTag} label="Catégorie" optional />
          <Select
            placeholder="Sélectionner une catégorie..."
            data={CATEGORIES}
            value={form.category}
            onChange={set('category')}
            size="md"
            clearable
            styles={{ input: { borderColor: '#d1d5db' } }}
          />
        </Box>

        {/* Features */}
        <Box>
          <SectionLabel icon={IconNotes} label="Caractéristiques clés" optional />
          <Textarea
            placeholder="Ex: Cuir véritable, fermeture dorée, 3 compartiments, bandoulière réglable..."
            value={form.features}
            onChange={set('features')}
            minRows={3}
            size="md"
            styles={{ input: { borderColor: '#d1d5db' } }}
          />
        </Box>

        {/* Target audience */}
        <Box>
          <SectionLabel icon={IconUsers} label="Audience cible" optional />
          <TextInput
            placeholder="Ex: Femmes 25–45 ans, professionnelles, urbaines"
            value={form.targetAudience}
            onChange={set('targetAudience')}
            size="md"
            styles={{ input: { borderColor: '#d1d5db' } }}
          />
        </Box>

        <Divider label={<Text size="xs" c="dimmed" fw={500}>Paramètres de génération</Text>} labelPosition="center" />

        {/* Tone */}
        <Box>
          <SectionLabel icon={IconMessageCircle} label="Ton de la description" />
          <Select
            data={TONES}
            value={form.tone}
            onChange={set('tone')}
            size="md"
            styles={{ input: { borderColor: '#d1d5db' } }}
          />
        </Box>

        {/* Language */}
        <Box>
          <SectionLabel icon={IconGlobe} label="Langue" />
          <SegmentedControl
            fullWidth
            value={form.language}
            onChange={set('language')}
            data={[
              { value: 'fr', label: '🇫🇷 Français' },
              { value: 'en', label: '🇺🇸 English' },
              { value: 'ar', label: '🇲🇦 Arabe' },
            ]}
            styles={{
              root: { background: '#f3f4f6', borderRadius: 8 },
              label: { fontSize: 13, fontWeight: 500 },
            }}
          />
        </Box>

        {/* Model */}
        <Box>
          <SectionLabel icon={IconCpu} label="Modèle IA" />
          <Select
            data={models.map(m => ({ value: m.id, label: m.label }))}
            value={form.model}
            onChange={set('model')}
            size="md"
            styles={{ input: { borderColor: '#d1d5db' } }}
          />
        </Box>

        {/* Extra instructions */}
        <Box>
          <SectionLabel icon={IconNotes} label="Instructions supplémentaires" optional />
          <TextInput
            placeholder="Ex: Max 150 mots, mettre en avant l'éco-responsabilité..."
            value={form.extraInstructions}
            onChange={set('extraInstructions')}
            size="md"
            styles={{ input: { borderColor: '#d1d5db' } }}
          />
        </Box>

        {/* Error */}
        {error && (
          <Box
            p="sm"
            style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8 }}
          >
            <Group gap="xs">
              <IconAlertCircle size={15} color="#e11d48" />
              <Text size="sm" c="#be123c">{error}</Text>
            </Group>
          </Box>
        )}

        {/* Submit */}
        <Button
          fullWidth
          size="md"
          variant="gradient"
          gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
          leftSection={isLoading ? <Loader size={15} color="white" /> : <IconSparkles size={16} />}
          onClick={handleSubmit}
          disabled={isLoading}
          mt="xs"
          style={{ fontWeight: 600, letterSpacing: 0.3 }}
        >
          {isLoading ? 'Génération en cours...' : 'Générer la description'}
        </Button>
      </Stack>
    </Paper>
  )
}
