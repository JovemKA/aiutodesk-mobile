import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Markdown } from '@/components/ui/Markdown';
import { useChat, type UIChatMessage } from '@/hooks/queries/useChat';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

export default function ChatScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { messages, send, sending, error } = useChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<UIChatMessage>>(null);

  const handleSend = () => {
    const text = draft;
    setDraft('');
    void send(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <ScreenLayout title="Assistente" subtitle="Tire dúvidas com a IA do AiutoDesk" scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <IconSymbol name="sparkles" color={theme.colors.primary} size={40} />
            <Text style={styles.emptyTitle}>Como posso ajudar?</Text>
            <Text style={styles.emptyText}>
              Descreva seu problema. Se eu não resolver, abro um chamado para o time de suporte.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <MessageBubble message={item} />}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Escreva sua mensagem…"
            placeholderTextColor={theme.colors.mutedText}
            style={styles.input}
            multiline
            editable={!sending}
          />
          <Pressable
            accessibilityLabel="Enviar"
            onPress={handleSend}
            disabled={sending || !draft.trim()}
            style={[styles.sendButton, sending || !draft.trim() ? styles.sendDisabled : null]}>
            <IconSymbol name="paperplane.fill" color={theme.colors.onPrimary} size={20} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

function MessageBubble({ message }: { message: UIChatMessage }) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={styles.userText}>{message.content}</Text>
        ) : (
          <Markdown>{message.content}</Markdown>
        )}
      </View>

      {message.escalatedTicketId ? (
        <View style={styles.escalation}>
          <IconSymbol name="exclamationmark.bubble" color={theme.colors.info} size={16} />
          <Text style={styles.escalationText}>Chamado aberto para o suporte.</Text>
        </View>
      ) : null}

      {message.sources && message.sources.length > 0 ? (
        <View style={styles.sources}>
          <Text style={styles.sourcesLabel}>Fontes</Text>
          {message.sources.map((s) => (
            <Pressable key={s.id} onPress={() => router.push(`/(app)/knowledge/${s.slug}` as never)}>
              <Text style={styles.sourceLink}>• {s.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    emptyTitle: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
    emptyText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
      textAlign: 'center',
    },
    bubbleWrap: { maxWidth: '88%' },
    bubbleWrapUser: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    bubbleWrapAssistant: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: {
      borderRadius: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    bubbleUser: { backgroundColor: theme.colors.bubbleUser },
    bubbleAssistant: {
      backgroundColor: theme.colors.bubbleAssistant,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    userText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.onPrimary,
    },
    escalation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    escalationText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.info,
    },
    sources: {
      marginTop: theme.spacing.xs,
      gap: 2,
    },
    sourcesLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
    },
    sourceLink: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    error: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.danger,
      paddingHorizontal: theme.spacing.lg,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.5 },
  });
