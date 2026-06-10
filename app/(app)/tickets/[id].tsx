import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { TicketMessage } from '@/components/tickets/TicketMessage';
import { TimelineEvent } from '@/components/tickets/TimelineEvent';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { OptionSheet, type SheetOption } from '@/components/ui/OptionSheet';
import { useAuth } from '@/features/auth/useAuth';
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  PRIORITY_TONE,
  REPLY_TEMPLATES,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TONE,
} from '@/features/tickets/ticketMeta';
import {
  useAssignableUsers,
  useAssignTicket,
  useChangePriority,
  useChangeStatus,
  useDeleteTicket,
  useReplyTicket,
  useTicket,
  useTicketAssist,
  useTicketEvents,
  useTicketMessages,
} from '@/hooks/queries/useTickets';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { TicketPriority, TicketStatus } from '@/services/api/types';
import { Theme } from '@/theme';

type Sheet = null | 'status' | 'priority' | 'assign' | 'template';
type ThreadFilter = 'all' | 'public' | 'team';

const UNASSIGN = '__unassign__';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useAuth();

  const { data: ticket, isLoading, isError, error } = useTicket(id);
  const { data: messages } = useTicketMessages(id);
  const { data: events } = useTicketEvents(id);

  const [sheet, setSheet] = useState<Sheet>(null);
  const { data: assignable } = useAssignableUsers(id, sheet === 'assign');

  const changeStatus = useChangeStatus(id);
  const changePriority = useChangePriority(id);
  const assign = useAssignTicket(id);
  const reply = useReplyTicket(id);
  const assist = useTicketAssist(id);
  const deleteTicket = useDeleteTicket();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState('');
  const [internal, setInternal] = useState(false);
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>('all');
  const [showTimeline, setShowTimeline] = useState(false);
  const [refs, setRefs] = useState<{ ticketId: string; title: string }[]>([]);
  const [composerError, setComposerError] = useState<string | null>(null);

  const visibleMessages = useMemo(() => {
    const list = messages ?? [];
    if (threadFilter === 'public') return list.filter((m) => !m.internalNote);
    if (threadFilter === 'team') return list.filter((m) => m.internalNote);
    return list;
  }, [messages, threadFilter]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    setComposerError(null);
    try {
      await reply.mutateAsync({ body: draft.trim(), internalNote: internal });
      setDraft('');
      setRefs([]);
    } catch (e) {
      setComposerError(getApiErrorMessage(e, 'Não foi possível enviar.'));
    }
  };

  const handleAssist = async () => {
    setComposerError(null);
    try {
      const res = await assist.mutateAsync(undefined);
      setDraft(res.suggestion);
      setRefs(res.referencedTickets ?? []);
      setInternal(false);
    } catch (e) {
      setComposerError(getApiErrorMessage(e, 'Assistente indisponível.'));
    }
  };

  if (isLoading) {
    return (
      <ScreenLayout title="Chamado">
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
      </ScreenLayout>
    );
  }
  if (isError || !ticket) {
    return (
      <ScreenLayout title="Chamado">
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{getApiErrorMessage(error, 'Não foi possível carregar o chamado.')}</Text>
        </View>
      </ScreenLayout>
    );
  }

  const statusOptions: SheetOption<TicketStatus>[] = STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] }));
  const priorityOptions: SheetOption<TicketPriority>[] = PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }));
  const assignOptions: SheetOption<string>[] = [
    { value: UNASSIGN, label: 'Remover atribuição' },
    ...(assignable ?? []).map((u) => ({ value: u.id, label: u.name, description: u.email })),
  ];
  const templateOptions: SheetOption<string>[] = REPLY_TEMPLATES.map((t, i) => ({
    value: String(i),
    label: t.label,
    description: t.body,
  }));

  return (
    <ScreenLayout title="Chamado" scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <IconSymbol name="chevron.right" color={theme.colors.primary} size={18} style={styles.backIcon} />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.badges}>
            <Badge label={STATUS_LABEL[ticket.status]} tone={STATUS_TONE[ticket.status]} />
            <Badge label={PRIORITY_LABEL[ticket.priority]} tone={PRIORITY_TONE[ticket.priority]} />
          </View>
          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.metaRow}>
            {ticket.department ? <Text style={styles.metaChip}>{ticket.department.name}</Text> : null}
            {ticket.category ? <Text style={styles.metaChip}>{ticket.category.name}</Text> : null}
          </View>
          <View style={styles.assignee}>
            <Text style={styles.metaLabel}>Atribuído a:</Text>
            {ticket.assignedUser ? (
              <View style={styles.person}>
                <Avatar name={ticket.assignedUser.name} size={22} />
                <Text style={styles.personName}>{ticket.assignedUser.name}</Text>
              </View>
            ) : (
              <Text style={styles.unassigned}>Não atribuído</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
          </View>

          {/* Agent actions */}
          <View style={styles.actions}>
            <ActionButton icon="slider.horizontal" label="Status" onPress={() => setSheet('status')} />
            <ActionButton icon="person.badge" label="Atribuir" onPress={() => setSheet('assign')} />
            <ActionButton icon="flag.fill" label="Prioridade" onPress={() => setSheet('priority')} />
          </View>

          {/* Edit / Delete */}
          <View style={styles.manageRow}>
            <Pressable
              style={styles.manageBtn}
              onPress={() => router.push(`/(app)/tickets/edit/${ticket.id}` as never)}>
              <IconSymbol name="pencil" color={theme.colors.primary} size={16} />
              <Text style={styles.manageText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.manageBtn} onPress={() => setConfirmDelete(true)}>
              <IconSymbol name="trash" color={theme.colors.danger} size={16} />
              <Text style={[styles.manageText, { color: theme.colors.danger }]}>Excluir</Text>
            </Pressable>
          </View>

          {/* Timeline (collapsible) */}
          <Pressable style={styles.timelineToggle} onPress={() => setShowTimeline((v) => !v)}>
            <IconSymbol name="clock.fill" color={theme.colors.mutedText} size={16} />
            <Text style={styles.timelineToggleText}>
              Histórico ({events?.length ?? 0}) {showTimeline ? '▲' : '▼'}
            </Text>
          </Pressable>
          {showTimeline && events && events.length > 0 ? (
            <View style={styles.timeline}>
              {events.map((ev, i) => (
                <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
              ))}
            </View>
          ) : null}

          {/* Thread filter */}
          <View style={styles.threadFilter}>
            {(['all', 'public', 'team'] as ThreadFilter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setThreadFilter(f)}
                style={[styles.threadTab, threadFilter === f ? styles.threadTabActive : null]}>
                <Text style={[styles.threadTabText, threadFilter === f ? styles.threadTabTextActive : null]}>
                  {f === 'all' ? 'Todos' : f === 'public' ? 'Públicos' : 'Equipe'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Messages */}
          <View style={styles.messages}>
            {visibleMessages.length === 0 ? (
              <Text style={styles.emptyThread}>Nenhuma mensagem neste filtro.</Text>
            ) : (
              visibleMessages.map((m) => (
                <TicketMessage key={m.id} message={m} ticket={ticket} currentUserId={user?.id} />
              ))
            )}
          </View>
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          {refs.length > 0 ? (
            <View style={styles.refs}>
              <IconSymbol name="sparkles" color={theme.colors.info} size={14} />
              {refs.map((r) => (
                <Pressable key={r.ticketId} onPress={() => router.push(`/(app)/tickets/${r.ticketId}` as never)}>
                  <Text style={styles.refChip} numberOfLines={1}>
                    {r.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.composerToolbar}>
            <Pressable
              style={[styles.modeBtn, !internal ? styles.modeBtnActive : null]}
              onPress={() => setInternal(false)}>
              <IconSymbol name="globe" color={!internal ? theme.colors.onPrimary : theme.colors.mutedText} size={14} />
              <Text style={[styles.modeText, !internal ? styles.modeTextActive : null]}>Pública</Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, internal ? styles.modeBtnActive : null]}
              onPress={() => setInternal(true)}>
              <IconSymbol name="lock.fill" color={internal ? theme.colors.onPrimary : theme.colors.mutedText} size={14} />
              <Text style={[styles.modeText, internal ? styles.modeTextActive : null]}>Nota</Text>
            </Pressable>
            <View style={styles.toolbarSpacer} />
            <Pressable style={styles.toolIcon} onPress={() => setSheet('template')}>
              <IconSymbol name="book.fill" color={theme.colors.mutedText} size={18} />
            </Pressable>
            <Pressable style={styles.toolIcon} onPress={handleAssist} disabled={assist.isPending}>
              {assist.isPending ? (
                <ActivityIndicator color={theme.colors.primary} size="small" />
              ) : (
                <IconSymbol name="sparkles" color={theme.colors.primary} size={18} />
              )}
            </Pressable>
          </View>

          {composerError ? <Text style={styles.composerError}>{composerError}</Text> : null}

          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={internal ? 'Escreva uma nota interna…' : 'Escreva uma resposta…'}
              placeholderTextColor={theme.colors.mutedText}
              style={styles.input}
              multiline
              editable={!reply.isPending}
            />
            <Pressable
              onPress={handleSend}
              disabled={reply.isPending || !draft.trim()}
              style={[styles.sendBtn, reply.isPending || !draft.trim() ? styles.sendDisabled : null]}>
              <IconSymbol name="paperplane.fill" color={theme.colors.onPrimary} size={20} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Sheets */}
      <OptionSheet<TicketStatus>
        visible={sheet === 'status'}
        title="Alterar status"
        options={statusOptions}
        selectedValue={ticket.status}
        onSelect={(v) => changeStatus.mutate(v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet<TicketPriority>
        visible={sheet === 'priority'}
        title="Alterar prioridade"
        options={priorityOptions}
        selectedValue={ticket.priority}
        onSelect={(v) => changePriority.mutate(v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet<string>
        visible={sheet === 'assign'}
        title="Atribuir chamado"
        options={assignOptions}
        selectedValue={ticket.assignedUser?.id ?? UNASSIGN}
        onSelect={(v) => assign.mutate(v === UNASSIGN ? null : v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet<string>
        visible={sheet === 'template'}
        title="Modelos de resposta"
        options={templateOptions}
        onSelect={(v) => {
          const tpl = REPLY_TEMPLATES[Number(v)];
          setDraft((prev) => (prev.trim() ? `${prev}\n\n${tpl.body}` : tpl.body));
        }}
        onClose={() => setSheet(null)}
      />

      <ConfirmSheet
        visible={confirmDelete}
        title="Excluir chamado"
        message={`Excluir "${ticket.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        loading={deleteTicket.isPending}
        onConfirm={async () => {
          await deleteTicket.mutateAsync(ticket.id);
          setConfirmDelete(false);
          router.back();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </ScreenLayout>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: 'slider.horizontal' | 'person.badge' | 'flag.fill';
  label: string;
  onPress: () => void;
}) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable style={({ pressed }) => [styles.action, pressed ? styles.actionPressed : null]} onPress={onPress}>
      <IconSymbol name={icon} color={theme.colors.primary} size={18} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: theme.spacing.lg, gap: theme.spacing.sm },
    back: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
    backIcon: { transform: [{ rotate: '180deg' }] },
    backText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    badges: { flexDirection: 'row', gap: theme.spacing.xs },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text,
    },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    metaChip: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
      backgroundColor: theme.colors.chip,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
    },
    assignee: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    metaLabel: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    person: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    personName: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    unassigned: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
      fontStyle: 'italic',
    },
    descriptionBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    descriptionText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      lineHeight: theme.typography.lineHeight.md,
      color: theme.colors.text,
    },
    manageRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xs },
    manageBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      backgroundColor: theme.colors.primarySoft,
    },
    manageText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
    action: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    actionPressed: { opacity: 0.7 },
    actionText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
    },
    timelineToggle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
    timelineToggleText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    timeline: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.md,
    },
    threadFilter: { flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
    threadTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    threadTabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    threadTabText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    threadTabTextActive: { color: theme.colors.onPrimary },
    messages: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    emptyThread: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
      fontStyle: 'italic',
    },
    composer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    refs: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.xs },
    refChip: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: 11,
      color: theme.colors.info,
      backgroundColor: theme.colors.infoBg,
      borderRadius: 999,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      maxWidth: 180,
    },
    composerToolbar: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    modeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modeBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    modeText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
    },
    modeTextActive: { color: theme.colors.onPrimary },
    toolbarSpacer: { flex: 1 },
    toolIcon: { padding: theme.spacing.xs },
    composerError: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.danger,
    },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm },
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
    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.5 },
    stateBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    stateText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
  });
