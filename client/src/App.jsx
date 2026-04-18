import { useState } from 'react'
import {
  AppShell, NavLink, Group, Text, Badge, Box,
  ThemeIcon, Divider, Stack, Tooltip, Avatar,
} from '@mantine/core'
import {
  IconWand, IconHistory, IconShoppingBag, IconBrandOpenai,
  IconSeo, IconMail, IconMessageChatbot, IconChartBar,
  IconSettings, IconCircleCheckFilled,
} from '@tabler/icons-react'
import ProductForm from './components/ProductForm'
import DescriptionResult from './components/DescriptionResult'
import History from './components/History'
import './index.css'

const NAV_ITEMS = [
  { id: 'generator', label: 'Descriptions produits', icon: IconWand, active: true },
  { id: 'history',   label: 'Historique',            icon: IconHistory,  active: true },
]

const SOON_ITEMS = [
  { label: 'Copy Marketing',  icon: IconMail },
  { label: 'Optimisation SEO', icon: IconSeo },
  { label: 'Analyse des avis', icon: IconChartBar },
  { label: 'Chatbot client',   icon: IconMessageChatbot },
]

export default function App() {
  const [page, setPage] = useState('generator')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  const handleResult = (data) => {
    setResult(data)
    setHistoryKey(k => k + 1)
  }

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding={0}
      styles={{
        main: { background: '#f1f4f9', minHeight: '100vh' },
        navbar: { background: '#1a1d2e', borderRight: '1px solid #2a2d3e' },
      }}
    >
      {/* ── Navbar ── */}
      <AppShell.Navbar p="md">
        {/* Logo */}
        <Box mb="xl">
          <Group gap="sm">
            <ThemeIcon
              size={40} radius="md"
              variant="gradient"
              gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
            >
              <IconShoppingBag size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={700} c="white" size="sm" lh={1.2}>E-Commerce AI</Text>
              <Text size="xs" c="dimmed">powered by OpenRouter</Text>
            </Box>
          </Group>
        </Box>

        <Text size="xs" fw={600} c="dimmed" tt="uppercase" ls={1} mb="xs">
          Outils IA
        </Text>

        <Stack gap={4} mb="lg">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.id}
              label={item.label}
              leftSection={
                <ThemeIcon
                  size={28} radius="sm"
                  variant={page === item.id ? 'filled' : 'subtle'}
                  color="violet"
                >
                  <item.icon size={15} />
                </ThemeIcon>
              }
              active={page === item.id}
              onClick={() => setPage(item.id)}
              styles={{
                root: {
                  borderRadius: 8,
                  color: page === item.id ? '#fff' : '#94a3b8',
                  backgroundColor: page === item.id ? 'rgba(124,58,237,0.25)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' },
                },
                label: { fontWeight: 500, fontSize: 13 },
              }}
            />
          ))}
        </Stack>

        <Divider color="#2a2d3e" mb="md" />

        <Text size="xs" fw={600} c="dimmed" tt="uppercase" ls={1} mb="xs">
          Bientôt disponible
        </Text>

        <Stack gap={4}>
          {SOON_ITEMS.map(item => (
            <Tooltip key={item.label} label="Bientôt disponible" position="right" withArrow>
              <NavLink
                label={item.label}
                leftSection={
                  <ThemeIcon size={28} radius="sm" variant="subtle" color="gray">
                    <item.icon size={15} />
                  </ThemeIcon>
                }
                rightSection={
                  <Badge size="xs" variant="outline" color="gray" radius="sm">Soon</Badge>
                }
                disabled
                styles={{
                  root: { borderRadius: 8, opacity: 0.5 },
                  label: { fontSize: 13, color: '#64748b' },
                }}
              />
            </Tooltip>
          ))}
        </Stack>

        {/* Footer */}
        <Box mt="auto" pt="md">
          <Divider color="#2a2d3e" mb="md" />
          <NavLink
            label="Paramètres"
            leftSection={
              <ThemeIcon size={28} radius="sm" variant="subtle" color="gray">
                <IconSettings size={15} />
              </ThemeIcon>
            }
            styles={{
              root: { borderRadius: 8, color: '#64748b', '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' } },
              label: { fontSize: 13 },
            }}
          />
          <Box
            mt="sm"
            p="sm"
            style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid #2a2d3e' }}
          >
            <Group gap="xs" mb={4}>
              <IconBrandOpenai size={14} color="#7c3aed" />
              <Text size="xs" fw={600} c="white">API Status</Text>
              <IconCircleCheckFilled size={13} color="#22c55e" style={{ marginLeft: 'auto' }} />
            </Group>
            <Text size="xs" c="dimmed">OpenRouter connecté</Text>
          </Box>
        </Box>
      </AppShell.Navbar>

      {/* ── Main ── */}
      <AppShell.Main>
        {page === 'generator' && (
          <GeneratorPage
            result={result}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onResult={handleResult}
          />
        )}
        {page === 'history' && (
          <Box p="xl">
            <History refreshTrigger={historyKey} />
          </Box>
        )}
      </AppShell.Main>
    </AppShell>
  )
}

function GeneratorPage({ result, isLoading, setIsLoading, onResult }) {
  return (
    <Box p="xl">
      {/* Page header */}
      <Box mb="xl">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Text size="xl" fw={700} c="#1e293b" mb={4}>
              Générateur de descriptions produits
            </Text>
            <Text size="sm" c="dimmed">
              Créez des descriptions e-commerce percutantes et optimisées en quelques secondes.
            </Text>
          </Box>
          <Badge
            size="lg" radius="md"
            variant="gradient"
            gradient={{ from: 'violet', to: 'indigo' }}
            leftSection={<IconWand size={13} />}
          >
            IA Générative
          </Badge>
        </Group>
      </Box>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        <ProductForm
          onResult={onResult}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <DescriptionResult result={result} isLoading={isLoading} />
      </div>
    </Box>
  )
}
