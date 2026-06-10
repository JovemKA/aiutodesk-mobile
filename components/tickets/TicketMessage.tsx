import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Markdown } from '@/components/ui/Markdown';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { Ticket, TicketMessage as TicketMessageType } from '@/services/api/types';
import { Theme } from '@/theme';
import { relativeTime } from '@/utils/datetime';

type Props = {
  message: TicketMessageType;
  ticket: Ticket;
  currentUserId?: string;
};

const ROLE_LABEL = { requester: 'Cliente', agent: 'Suporte', system: 'Sistema' } as const;
const ROLE_TONE = { requester: 'info', agent: 'success', system: 'neutral' } as const;

function resolveName(message: TicketMessageType, ticket: Ticket, currentUserId?: string): string {
  if (message.authorId && message.authorId === currentUserId) return 'Você';
  if (message.authorId === ticket.requester?.id) return ticket.requester?.name ?? 'Cliente';
  if (message.authorId === ticket.assignedUser?.id) return ticket.assignedUser?.name ?? 'Suporte';
  return ROLE_LABEL[message.authorRole];
}

export function TicketMessage({ message, ticket, currentUserId }: Props) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const name = resolveName(message, ticket, currentUserId);

  return (
    <View style={[styles.container, message.internalNote ? styles.internal : null]}>
      <Avatar name={name} size={32} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Badge label={ROLE_LABEL[message.authorRole]} tone={ROLE_TONE[message.authorRole]} small />
          {message.internalNote ? <Badge label="Nota interna" tone="warning" small /> : null}
          <Text style={styles.time}>{relativeTime(message.createdAt)}</Text>
        </View>

        <Markdown>{message.body}</Markdown>

        {message.attachments && message.attachments.length > 0 ? (
          <View style={styles.attachments}>
            {message.attachments.map((att) => (
              <Pressable
                key={att.url}
                style={styles.attachment}
                onPress={() => Linking.openURL(att.url).catch(() => {})}>
                <IconSymbol name="paperclip" color={theme.colors.primary} size={16} />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name}
                </Text>
                <Text style={styles.attachmentSize}>{Math.round(att.size / 1024)} KB</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    internal: {
      backgroundColor: theme.colors.warningBg,
      borderColor: theme.colors.warning,
    },
    content: { flex: 1, gap: theme.spacing.xs },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    name: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    time: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: 11,
      color: theme.colors.mutedText,
      marginLeft: 'auto',
    },
    attachments: { gap: theme.spacing.xs, marginTop: theme.spacing.xs },
    attachment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      backgroundColor: theme.colors.chip,
    },
    attachmentName: {
      flex: 1,
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    attachmentSize: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: 11,
      color: theme.colors.mutedText,
    },
  });
