import { useState, useEffect } from 'react'
import {
  Paper, Box, Text, Group, Badge, ActionIcon, Stack,
  TextInput, Button, Divider, Collapse, Avatar, Tooltip,
  ThemeIcon, CopyButton, Skeleton, Center,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconHistory, IconSearch, IconTrash, IconCopy, IconCheck,
  IconChevronDown, IconChevronUp, IconClock, IconPackage,
  IconAlertTriangle, IconX, IconInbox,
} from '@tabler/icons-react'
import { getHistory, deleteHistoryItem, clearHistory } from '../api'

const TONE_CONFIG = {
  professionnel:  { color: 'blue',   label: 'Professionnel' },
  luxueux:        { color: 'violet', label: 'Luxueux' },
  'décontracté':  { color: 'teal',   label: 'Décontracté' },
  technique:      { color: 'orange', label: 'Technique' },
  minimaliste:    { color: 'gray',   label: 'Minimaliste' },
  enthousiaste:   { color: 'pink',   label: 'Enthousiaste' },
}

const AVATAR_GRADIENTS = [
  { from: 'violet', to: 'indigo' }, { from: 'teal', to: 'cyan' },
  { from: 'pink', to: 'rose' },     { from: 'orange', to: 'amber' },
  { from: 'blue', to: 'sky' },
]

function HistoryRow({ item, onDelete }) {
  const [opened, { toggle }] = useDisclosure(false)

  const date = new Date(item.created_at).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const gradIdx = item.product_name.charCodeAt(0) % AVATAR_GRADIENTS.length
  const toneConf = TONE_CONFIG[item.tone] || { color: 'gray', label: item.tone }

  return (
    <Paper withBorder shadow="none" style={{ borderColor: opened ? '#c4b5fd' : '#e5e7eb', overflow: 'hidden' }}>
      {/* Row */}
      <Group
        gap="md" px="md" py="sm"
        style={{ cursor: 'pointer', background: opened ? '#faf5ff' : 'white' }}
        onClick={toggle}
      >
        <Avatar
          radius="md" size={40}
          variant="gradient"
          gradient={AVATAR_GRADIENTS[gradIdx]}
        >
          <Text fw={700} size="sm" c="white">{item.product_name[0].toUpperCase()}</Text>
        </Avatar>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" mb={2}>
            <Text fw={600} size="sm" c="#111827" truncate style={{ maxWidth: 260 }}>
              {item.product_name}
            </Text>
            {item.tone && (
              <Badge size="xs" variant="light" color={toneConf.color} radius="sm">
                {toneConf.label}
              </Badge>
            )}
            {item.category && (
              <Badge size="xs" variant="outline" color="gray" radius="sm">
                {item.category}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            <IconClock size={11} color="#9ca3af" />
            <Text size="xs" c="dimmed">{date}</Text>
            <Text size="xs" c="dimmed">·</Text>
            <Text size="xs" c="dimmed">{item.model_used?.split('/')[1] || item.model_used}</Text>
          </Group>
        </Box>

        <Group gap={4} onClick={e => e.stopPropagation()}>
          <CopyButton value={item.generated_description} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copié !' : 'Copier'} withArrow position="top">
                <ActionIcon
                  variant="subtle" color={copied ? 'teal' : 'gray'}
                  size="md" radius="md"
                  onClick={() => { copy(); notifications.show({ message: 'Description copiée !', color: 'teal', icon: <IconCheck size={14} />, autoClose: 1800 }) }}
                >
                  {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Supprimer" withArrow position="top">
            <ActionIcon
              variant="subtle" color="red" size="md" radius="md"
              onClick={() => onDelete(item.id)}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon variant="subtle" color="gray" size="md" radius="md" onClick={toggle}>
            {opened ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
          </ActionIcon>
        </Group>
      </Group>

      {/* Expanded */}
      <Collapse in={opened}>
        <Divider color="#f3e8ff" />
        <Box p="md" style={{ background: '#fafafa' }}>
          {item.features && (
            <Group gap="xs" mb="sm">
              <IconPackage size={13} color="#7c3aed" />
              <Text size="xs" c="dimmed" fw={500}>Caractéristiques :</Text>
              <Text size="xs" c="#6b7280">{item.features}</Text>
            </Group>
          )}
          <Paper p="md" withBorder style={{ borderColor: '#e5e7eb', background: 'white' }}>
            <Text size="sm" c="#374151" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {item.generated_description}
            </Text>
          </Paper>
          <Group justify="space-between" mt="sm">
            <Badge size="sm" variant="light" color="violet">{item.model_used}</Badge>
            <Text size="xs" c="dimmed">
              {item.language === 'fr' ? '🇫🇷 Français' : item.language === 'ar' ? '🇲🇦 Arabe' : '🇺🇸 English'}
            </Text>
          </Group>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default function History({ refreshTrigger }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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

  const filtered = items.filter(i =>
    i.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Group gap="sm" mb={4}>
            <ThemeIcon size={36} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
              <IconHistory size={18} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="#111827">Historique des générations</Text>
          </Group>
          <Text size="sm" c="dimmed" pl={44}>
            {items.length} description{items.length !== 1 ? 's' : ''} enregistrée{items.length !== 1 ? 's' : ''}
          </Text>
        </Box>

        {items.length > 0 && (
          confirmClear ? (
            <Group gap="xs" p="sm" style={{ background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
              <IconAlertTriangle size={15} color="#f97316" />
              <Text size="sm" fw={500} c="#c2410c">Confirmer la suppression ?</Text>
              <Button size="xs" color="red" variant="filled" radius="md" onClick={handleClearAll}>Oui</Button>
              <Button size="xs" color="gray" variant="subtle" radius="md" onClick={() => setConfirmClear(false)}>Non</Button>
            </Group>
          ) : (
            <Button
              size="sm" variant="light" color="red" radius="md"
              leftSection={<IconTrash size={14} />}
              onClick={() => setConfirmClear(true)}
            >
              Tout effacer
            </Button>
          )
        )}
      </Group>

      {/* Search */}
      {items.length > 0 && (
        <TextInput
          mb="md"
          placeholder="Rechercher un produit ou une catégorie..."
          leftSection={<IconSearch size={15} />}
          rightSection={search && (
            <ActionIcon variant="subtle" size="sm" onClick={() => setSearch('')}>
              <IconX size={13} />
            </ActionIcon>
          )}
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="md"
          radius="md"
          styles={{ input: { borderColor: '#d1d5db' } }}
        />
      )}

      {/* Content */}
      {loading ? (
        <Stack gap="sm">
          {[1, 2, 3, 4].map(i => (
            <Paper key={i} withBorder p="md" style={{ borderColor: '#e5e7eb' }}>
              <Group gap="md">
                <Skeleton height={40} width={40} radius="md" />
                <Box style={{ flex: 1 }}>
                  <Skeleton height={14} width="45%" mb={8} />
                  <Skeleton height={11} width="25%" />
                </Box>
                <Skeleton height={32} width={80} radius="md" />
              </Group>
            </Paper>
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Center py={80}>
          <Stack align="center" gap="md">
            <ThemeIcon size={64} radius="xl" variant="light" color="gray">
              <IconInbox size={28} />
            </ThemeIcon>
            <Box ta="center">
              <Text fw={600} c="#374151" mb={4}>Aucune génération</Text>
              <Text size="sm" c="dimmed">Vos descriptions générées apparaîtront ici.</Text>
            </Box>
          </Stack>
        </Center>
      ) : filtered.length === 0 ? (
        <Center py={60}>
          <Stack align="center" gap="sm">
            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
              <IconSearch size={22} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              Aucun résultat pour "<Text component="span" fw={600} c="#374151">{search}</Text>"
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {filtered.map(item => (
            <HistoryRow key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
