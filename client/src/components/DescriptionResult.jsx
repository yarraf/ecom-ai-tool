import { useState } from 'react'
import {
  Paper, Box, Text, Group, Badge, Button, Skeleton,
  Stack, ThemeIcon, CopyButton, Divider, ActionIcon, Tooltip,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconSparkles, IconCopy, IconCheck, IconCpu,
  IconFileText, IconRefresh, IconWand,
} from '@tabler/icons-react'

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <Paper shadow="xs" p="xl" withBorder style={{ borderColor: '#e5e7eb' }}>
      <Group gap="sm" mb="lg">
        <Skeleton height={36} width={36} radius="md" />
        <Box>
          <Skeleton height={14} width={160} mb={6} />
          <Skeleton height={11} width={100} />
        </Box>
        <Box ml="auto">
          <Skeleton height={32} width={90} radius="md" />
        </Box>
      </Group>
      <Stack gap="sm">
        {[95, 80, 100, 70, 88, 60, 75, 45].map((w, i) => (
          <Skeleton key={i} height={13} width={`${w}%`} radius="sm" />
        ))}
        <Box mt="xs">
          {[['•', 72], ['•', 85], ['•', 65]].map(([, w], i) => (
            <Group key={i} gap="sm" mb={8}>
              <Skeleton height={8} width={8} circle />
              <Skeleton height={12} width={`${w}%`} radius="sm" />
            </Group>
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <Paper
      shadow="xs" p="xl" withBorder
      style={{ borderColor: '#e5e7eb', borderStyle: 'dashed', background: '#fafbff' }}
    >
      <Stack align="center" gap="md" py="xl">
        <ThemeIcon
          size={64} radius="xl"
          variant="gradient"
          gradient={{ from: '#f3f0ff', to: '#ede9fe', deg: 135 }}
          style={{ border: '1px solid #ddd6fe' }}
        >
          <IconFileText size={28} color="#7c3aed" />
        </ThemeIcon>
        <Box ta="center">
          <Text fw={600} size="md" c="#374151" mb={6}>
            Prêt à générer
          </Text>
          <Text size="sm" c="dimmed" maw={320} mx="auto" lh={1.6}>
            Renseignez les informations de votre produit dans le formulaire et cliquez sur{' '}
            <Text component="span" fw={600} c="violet.6">Générer la description</Text>.
          </Text>
        </Box>
        <Group gap="xs" mt="xs">
          {['Multilingue', 'SEO-friendly', 'Personnalisable', 'Instant'].map(t => (
            <Badge key={t} size="sm" variant="light" color="violet" radius="sm">{t}</Badge>
          ))}
        </Group>
      </Stack>
    </Paper>
  )
}

/* ── Markdown-like text renderer ── */
function RenderDescription({ text }) {
  const lines = text.split('\n')
  const elements = []

  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) { elements.push(<Box key={i} h={6} />); return }

    // Bold inline parser
    const parseBold = (str) => str.split(/\*\*(.*?)\*\*/g).map((p, j) =>
      j % 2 === 1
        ? <Text key={j} component="span" fw={700} c="#111827">{p}</Text>
        : p
    )

    // H2 / H3
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={i} fw={700} size="md" c="#111827" mt="sm">{parseBold(line.slice(3))}</Text>
      )
      return
    }
    if (line.startsWith('### ')) {
      elements.push(
        <Text key={i} fw={600} size="sm" c="#374151" mt="xs">{parseBold(line.slice(4))}</Text>
      )
      return
    }

    // Bullet
    const bullet = line.match(/^[-•*]\s+(.+)/)
    if (bullet) {
      elements.push(
        <Group key={i} gap="xs" align="flex-start" pl="xs">
          <Box mt={7} w={6} h={6} style={{ background: '#7c3aed', borderRadius: '50%', flexShrink: 0 }} />
          <Text size="sm" c="#374151" lh={1.7} style={{ flex: 1 }}>{parseBold(bullet[1])}</Text>
        </Group>
      )
      return
    }

    // Numbered
    const num = line.match(/^(\d+)\.\s+(.+)/)
    if (num) {
      elements.push(
        <Group key={i} gap="sm" align="flex-start" pl="xs">
          <ThemeIcon size={20} radius="xl" variant="light" color="violet" style={{ flexShrink: 0, marginTop: 2 }}>
            <Text size="xs" fw={700}>{num[1]}</Text>
          </ThemeIcon>
          <Text size="sm" c="#374151" lh={1.7} style={{ flex: 1 }}>{parseBold(num[2])}</Text>
        </Group>
      )
      return
    }

    // Normal paragraph
    elements.push(
      <Text key={i} size="sm" c="#374151" lh={1.8}>{parseBold(line)}</Text>
    )
  })

  return <Stack gap={4}>{elements}</Stack>
}

/* ── Main component ── */
export default function DescriptionResult({ result, isLoading }) {
  if (isLoading) return <LoadingSkeleton />
  if (!result) return <EmptyState />

  return (
    <Paper
      shadow="xs" p={0} withBorder
      style={{ borderColor: '#e5e7eb', overflow: 'hidden' }}
      className="fade-in"
    >
      {/* Header */}
      <Box
        px="xl" py="md"
        style={{
          background: 'linear-gradient(135deg, #7c3aed11 0%, #4f46e511 100%)',
          borderBottom: '1px solid #ede9fe',
        }}
      >
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon size={38} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
              <IconWand size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="sm" c="#111827">Description générée</Text>
              {result.tokensUsed && (
                <Group gap={4} mt={2}>
                  <IconCpu size={11} color="#9ca3af" />
                  <Text size="xs" c="dimmed">{result.tokensUsed} tokens</Text>
                </Group>
              )}
            </Box>
          </Group>

          <Group gap="xs">
            <Tooltip label="Regénérer" withArrow position="top">
              <ActionIcon variant="light" color="violet" size="lg" radius="md">
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
            <CopyButton value={result.description} timeout={2500}>
              {({ copied, copy }) => (
                <Button
                  size="sm"
                  variant={copied ? 'filled' : 'light'}
                  color={copied ? 'teal' : 'violet'}
                  leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  onClick={() => {
                    copy()
                    if (!copied) {
                      notifications.show({
                        title: 'Copié !',
                        message: 'La description a été copiée dans le presse-papier.',
                        color: 'teal',
                        icon: <IconCheck size={16} />,
                        autoClose: 2500,
                      })
                    }
                  }}
                  radius="md"
                >
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              )}
            </CopyButton>
          </Group>
        </Group>
      </Box>

      {/* Content */}
      <Box px="xl" py="lg">
        <RenderDescription text={result.description} />
      </Box>

      {/* Footer */}
      <Divider color="#f3f4f6" />
      <Box px="xl" py="sm" style={{ background: '#fafafa' }}>
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="xs" c="dimmed">Modèle :</Text>
            <Badge size="sm" variant="light" color="violet" radius="sm">
              {result.model}
            </Badge>
          </Group>
          <Group gap="xs">
            <IconSparkles size={12} color="#9ca3af" />
            <Text size="xs" c="dimmed">Généré par OpenRouter</Text>
          </Group>
        </Group>
      </Box>
    </Paper>
  )
}
