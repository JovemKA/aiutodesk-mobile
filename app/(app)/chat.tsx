import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { ChatHistorySheet } from '@/components/chat/ChatHistorySheet';
import { ScreenLayout } from '@/components/ScreenLayout';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Markdown } from '@/components/ui/Markdown';
import { TypingDots } from '@/components/ui/TypingDots';
import { useAuth } from '@/features/auth/useAuth';
import { useChat, type UIChatMessage } from '@/hooks/queries/useChat';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

const MAX_CHARS = 4000;

type Suggestion = { text: string; icon: IconSymbolName };

const SUGGESTIONS: Suggestion[] = [
  { text: 'Como faço para resetar minha senha?', icon: 'lock.reset' },
  { text: 'Quero abrir um novo chamado', icon: 'plus.circle.fill' },
  { text: 'Estou com problemas na VPN', icon: 'key.fill' },
  { text: 'Quem é você?', icon: 'info.circle' },
];

export default function ChatScreen() {
  const { theme } = useThemeMode();
  const { width } = useWindowDimensions();
  const chipWidth = (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuth();
  const { messages, send, streaming, error, reset, loadConversation, conversationId } = useChat();
  const [draft, setDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const listRef = useRef<FlatList<UIChatMessage>>(null);

  const firstName = user?.name?.split(' ')[0] ?? 'tudo bem';
  const hasMessages = messages.length > 0;

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || streaming) return;
    setDraft('');
    void send(t);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <ScreenLayout title="Assistente" subtitle="Tire dúvidas com a IA do AiutoDesk" scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={reset} disabled={!hasMessages && !conversationId}>
            <IconSymbol name="plus" color={theme.colors.primary} size={16} />
            <Text style={styles.actionText}>Nova conversa</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setHistoryOpen(true)}>
            <IconSymbol name="clock.arrow.circlepath" color={theme.colors.primary} size={16} />
            <Text style={styles.actionText}>Histórico</Text>
          </Pressable>
        </View>

        {!hasMessages ? (
          <ScrollView
            contentContainerStyle={styles.welcomeContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeAvatar}>
              <IconSymbol name="bot" color={theme.colors.primaryDark} size={34} />
            </View>
            <Text style={styles.welcomeTitle}>Olá, {firstName}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Posso te ajudar com dúvidas rápidas, navegação do sistema e abertura de chamados.
            </Text>

            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s.text}
                  onPress={() => submit(s.text)}
                  style={({ pressed }) => [
                    styles.chip,
                    { width: chipWidth },
                    pressed ? styles.chipPressed : null,
                  ]}>
                  <IconSymbol name={s.icon} color={theme.colors.primary} size={18} />
                  <Text style={styles.chipText}>{s.text}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <MessageBubble message={item} />}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={hasMessages ? 'Continue a conversa…' : 'Digite sua dúvida…'}
              placeholderTextColor={theme.colors.mutedText}
              style={styles.input}
              multiline
              maxLength={MAX_CHARS}
              editable={!streaming}
            />
            <Pressable
              accessibilityLabel="Enviar"
              onPress={() => submit(draft)}
              disabled={streaming || !draft.trim()}
              style={[styles.sendButton, streaming || !draft.trim() ? styles.sendDisabled : null]}>
              <IconSymbol name="paperplane.fill" color={theme.colors.onPrimary} size={20} />
            </Pressable>
          </View>
          {draft.length > MAX_CHARS - 400 ? (
            <Text style={[styles.counter, draft.length >= MAX_CHARS ? styles.counterMax : null]}>
              {draft.length}/{MAX_CHARS}
            </Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      <ChatHistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        activeId={conversationId}
        onSelect={(id) => void loadConversation(id)}
        onNew={reset}
      />
    </ScreenLayout>
  );
}

function BlinkingCursor() {
  const { theme } = useThemeMode();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.Text style={{ opacity, color: theme.colors.primary, fontSize: theme.typography.fontSize.md }}>
      ▍
    </Animated.Text>
  );
}

function MessageBubble({ message }: { message: UIChatMessage }) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const isUser = message.role === 'user';
  const showEscalation = !message.isStreaming && (message.shouldEscalate || message.escalatedTicketId);

  if (isUser) {
    return (
      <View style={[styles.bubbleWrap, styles.bubbleWrapUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <View style={styles.botAvatar}>
        <IconSymbol name="bot" color={theme.colors.primaryDark} size={18} />
      </View>
      <View style={styles.assistantColumn}>
        <View style={[styles.bubble, styles.bubbleAssistant]}>
          {message.content.length === 0 && message.isStreaming ? (
            <TypingDots />
          ) : (
            <View style={styles.assistantContent}>
              <Markdown>{message.content}</Markdown>
              {message.isStreaming ? <BlinkingCursor /> : null}
            </View>
          )}
        </View>

        {message.sources && message.sources.length > 0 ? (
          <View style={styles.sources}>
            <Text style={styles.sourcesLabel}>Fontes consultadas</Text>
            <View style={styles.sourcePills}>
              {message.sources.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(`/(app)/knowledge/${s.slug}` as never)}
                  style={styles.sourcePill}>
                  <IconSymbol name="book.fill" color={theme.colors.primaryDark} size={13} />
                  <Text style={styles.sourcePillText} numberOfLines={1}>
                    {s.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {showEscalation ? (
          <View style={styles.escalation}>
            <Text style={styles.escalationText}>
              Vou encaminhar este atendimento para um atendente humano.
            </Text>
            <Pressable
              style={styles.escalationButton}
              onPress={() => router.push('/(app)/tickets' as never)}>
              <Text style={styles.escalationButtonText}>
                {message.escalatedTicketId ? 'Ver chamado aberto' : 'Abrir chamado com atendente'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },

    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xs,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      backgroundColor: theme.colors.primarySoft,
    },
    actionText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
    },

    welcomeContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    welcomeAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    welcomeTitle: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      maxWidth: 420,
    },
    suggestions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minHeight: 56,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    chipPressed: {
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.primary,
    },
    chipText: {
      flex: 1,
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },

    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    bubbleWrap: { maxWidth: '86%' },
    bubbleWrapUser: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    bubble: {
      borderRadius: 16,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    bubbleUser: {
      backgroundColor: theme.colors.bubbleUser,
      borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
      backgroundColor: theme.colors.bubbleAssistant,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderBottomLeftRadius: 4,
    },
    userText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.onPrimary,
    },
    assistantRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      maxWidth: '92%',
    },
    botAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    assistantColumn: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    assistantContent: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
    },

    sources: { gap: theme.spacing.xs },
    sourcesLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primaryDark,
    },
    sourcePills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    sourcePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      maxWidth: 220,
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.borderStrong,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    sourcePillText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primaryDark,
    },

    escalation: {
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.warningBg,
      borderRadius: 12,
      padding: theme.spacing.md,
    },
    escalationText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.warningFg,
    },
    escalationButton: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.accent,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    escalationButtonText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.onPrimary,
    },

    error: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.danger,
      paddingHorizontal: theme.spacing.lg,
    },

    inputArea: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      gap: 2,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.borderStrong,
      borderWidth: 1,
      borderRadius: 16,
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
    sendDisabled: { opacity: 0.45 },
    counter: {
      alignSelf: 'flex-end',
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
    },
    counterMax: { color: theme.colors.warning },
  });
