import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EVENT_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '@/features/tickets/ticketMeta';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { TicketEvent, TicketPriority, TicketStatus } from '@/services/api/types';
import { Theme } from '@/theme';
import { formatDateTime } from '@/utils/datetime';

function describe(event: TicketEvent): string | null {
  const meta = event.metadata ?? {};
  const from = meta.from as string | undefined;
  const to = meta.to as string | undefined;
  if (event.type === 'STATUS_CHANGE' && to) {
    const f = from ? STATUS_LABEL[from as TicketStatus] ?? from : null;
    const t = STATUS_LABEL[to as TicketStatus] ?? to;
    return f ? `${f} → ${t}` : t;
  }
  if (event.type === 'PRIORITY_CHANGE' && to) {
    const f = from ? PRIORITY_LABEL[from as TicketPriority] ?? from : null;
    const t = PRIORITY_LABEL[to as TicketPriority] ?? to;
    return f ? `${f} → ${t}` : t;
  }
  return null;
}

export function TimelineEvent({ event, isLast }: { event: TicketEvent; isLast: boolean }) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const detail = describe(event);

  return (
    <View style={styles.row}>
      <View style={styles.gutter}>
        <View style={styles.dot} />
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{EVENT_LABEL[event.type]}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        <Text style={styles.meta}>
          {event.actor?.name ? `${event.actor.name} · ` : ''}
          {formatDateTime(event.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.sm },
    gutter: { alignItems: 'center', width: 16 },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },
    line: {
      flex: 1,
      width: 2,
      backgroundColor: theme.colors.border,
      marginTop: 2,
    },
    content: { flex: 1, paddingBottom: theme.spacing.md, gap: 2 },
    label: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    detail: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    meta: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: 11,
      color: theme.colors.subtleText,
    },
  });
