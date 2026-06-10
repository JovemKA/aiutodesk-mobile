import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { TicketCard } from '@/components/tickets/TicketCard';
import { AppButton } from '@/components/ui/AppButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { OptionSheet, type SheetOption } from '@/components/ui/OptionSheet';
import { TextField } from '@/components/ui/TextField';
import { PRIORITY_LABEL, PRIORITY_ORDER, STATUS_LABEL, STATUS_ORDER } from '@/features/tickets/ticketMeta';
import { useAuth } from '@/features/auth/useAuth';
import { useTickets } from '@/hooks/queries/useTickets';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { TicketPriority, TicketStatus } from '@/services/api/types';
import { Theme } from '@/theme';

export default function TicketsListScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useAuth();

  const [status, setStatus] = useState<TicketStatus | undefined>(undefined);
  const [priority, setPriority] = useState<TicketPriority | undefined>(undefined);
  const [mine, setMine] = useState(false);
  const [query, setQuery] = useState('');
  const [prioritySheet, setPrioritySheet] = useState(false);

  const filters = useMemo(
    () => ({ status, priority, assignedTo: mine ? user?.id : undefined }),
    [status, priority, mine, user?.id],
  );
  const { data, isLoading, isError, error, refetch, isRefetching } = useTickets(filters);

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const tickets = data ?? [];
    if (!normalized) return tickets;
    return tickets.filter((t) => t.title.toLowerCase().includes(normalized));
  }, [data, normalized]);

  const priorityOptions: SheetOption<TicketPriority | 'all'>[] = [
    { value: 'all', label: 'Todas as prioridades' },
    ...PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] })),
  ];

  return (
    <ScreenLayout title="Chamados" subtitle="Fila de atendimento">
      <AppButton label="Novo chamado" onPress={() => router.push('/(app)/tickets/new' as never)} />

      <TextField value={query} onChangeText={setQuery} placeholder="Buscar por título" autoCapitalize="none" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" active={!status} onPress={() => setStatus(undefined)} />
        {STATUS_ORDER.map((s) => (
          <Chip key={s} label={STATUS_LABEL[s]} active={status === s} onPress={() => setStatus(s)} />
        ))}
      </ScrollView>

      <View style={styles.filterRow}>
        <Chip label="Atribuídos a mim" active={mine} onPress={() => setMine((m) => !m)} icon="person.badge" />
        <Pressable style={styles.filterBtn} onPress={() => setPrioritySheet(true)}>
          <IconSymbol name="flag.fill" color={theme.colors.mutedText} size={16} />
          <Text style={styles.filterBtnText}>{priority ? PRIORITY_LABEL[priority] : 'Prioridade'}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.spinner} />
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{getApiErrorMessage(error, 'Erro ao carregar chamados.')}</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Nenhum chamado encontrado. Ajuste os filtros ou crie um novo.</Text>
        </View>
      ) : (
        filtered.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onPress={() => router.push(`/(app)/tickets/${ticket.id}` as never)}
          />
        ))
      )}

      {isRefetching ? <ActivityIndicator color={theme.colors.primary} /> : null}

      <OptionSheet<TicketPriority | 'all'>
        visible={prioritySheet}
        title="Filtrar por prioridade"
        options={priorityOptions}
        selectedValue={priority ?? 'all'}
        onSelect={(v) => setPriority(v === 'all' ? undefined : (v as TicketPriority))}
        onClose={() => setPrioritySheet(false)}
      />
    </ScreenLayout>
  );
}

function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: 'person.badge';
}) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      {icon ? (
        <IconSymbol name={icon} color={active ? theme.colors.onPrimary : theme.colors.mutedText} size={14} />
      ) : null}
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    chips: { gap: theme.spacing.xs, paddingVertical: 2 },
    filterRow: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    chipTextActive: { color: theme.colors.onPrimary },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterBtnText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    spinner: { marginTop: theme.spacing.xl },
    stateBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    stateText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    retry: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
  });
