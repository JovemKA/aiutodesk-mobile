import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from '@/features/tickets/ticketMeta';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { Ticket } from '@/services/api/types';
import { Theme } from '@/theme';
import { relativeTime } from '@/utils/datetime';

export function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
      <View style={styles.badges}>
        <Badge label={STATUS_LABEL[ticket.status]} tone={STATUS_TONE[ticket.status]} small />
        <Badge label={PRIORITY_LABEL[ticket.priority]} tone={PRIORITY_TONE[ticket.priority]} small />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {ticket.title}
      </Text>

      <View style={styles.meta}>
        {ticket.department ? <Text style={styles.dept}>{ticket.department.name}</Text> : null}
        <Text style={styles.date}>{relativeTime(ticket.createdAt)}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.person}>
          <Avatar name={ticket.requester?.name ?? '?'} size={22} />
          <Text style={styles.personName} numberOfLines={1}>
            {ticket.requester?.name ?? '—'}
          </Text>
        </View>
        <View style={styles.assignee}>
          {ticket.assignedUser ? (
            <>
              <Avatar name={ticket.assignedUser.name} size={22} />
              <Text style={styles.personName} numberOfLines={1}>
                {ticket.assignedUser.name}
              </Text>
            </>
          ) : (
            <>
              <IconSymbol name="person.badge" color={theme.colors.mutedText} size={16} />
              <Text style={styles.unassigned}>Não atribuído</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    pressed: { opacity: 0.85 },
    badges: { flexDirection: 'row', gap: theme.spacing.xs },
    title: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    meta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    dept: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
    },
    date: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    person: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, flex: 1 },
    assignee: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, flex: 1, justifyContent: 'flex-end' },
    personName: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
      flexShrink: 1,
    },
    unassigned: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
      fontStyle: 'italic',
    },
  });
