import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { groupConversations, useConversationActions, useConversations } from '@/hooks/queries/useConversations';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { ChatConversation } from '@/services/api/types';
import { Theme } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export function ChatHistorySheet({ visible, onClose, activeId, onSelect, onNew }: Props) {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, isError, refetch } = useConversations(false);
  const { data: archived } = useConversations(true);
  const { rename, archive, unarchive, remove } = useConversationActions();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const groups = useMemo(() => groupConversations(data ?? []), [data]);
  const archivedItems = archived ?? [];

  const confirmDelete = (id: string) => {
    Alert.alert('Excluir conversa', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remove.mutate(id) },
    ]);
  };

  const commitRename = (id: string) => {
    // Guard against the double fire (onSubmitEditing + onBlur).
    if (editingId !== id) return;
    const title = draftTitle.trim();
    if (title) rename.mutate({ id, title });
    setEditingId(null);
    setDraftTitle('');
  };

  const renderRow = (c: ChatConversation, isArchived: boolean) => {
    const isActive = c.id === activeId;
    const isEditing = c.id === editingId;
    return (
      <View key={c.id} style={[styles.item, isActive ? styles.itemActive : null]}>
        {isEditing ? (
          <TextInput
            value={draftTitle}
            onChangeText={setDraftTitle}
            autoFocus
            onSubmitEditing={() => commitRename(c.id)}
            onBlur={() => commitRename(c.id)}
            placeholder="Título da conversa"
            placeholderTextColor={theme.colors.mutedText}
            style={styles.renameInput}
          />
        ) : (
          <Pressable
            style={styles.itemMain}
            onPress={() => {
              onSelect(c.id);
              onClose();
            }}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {c.title || 'Conversa sem título'}
            </Text>
          </Pressable>
        )}

        <View style={styles.itemActions}>
          {isArchived ? (
            <Pressable hitSlop={6} onPress={() => unarchive.mutate(c.id)} accessibilityLabel="Desarquivar">
              <IconSymbol name="clock.arrow.circlepath" color={theme.colors.mutedText} size={18} />
            </Pressable>
          ) : (
            <>
              <Pressable
                hitSlop={6}
                accessibilityLabel="Renomear"
                onPress={() => {
                  setEditingId(c.id);
                  setDraftTitle(c.title ?? '');
                }}>
                <IconSymbol name="pencil" color={theme.colors.mutedText} size={18} />
              </Pressable>
              <Pressable hitSlop={6} accessibilityLabel="Arquivar" onPress={() => archive.mutate(c.id)}>
                <IconSymbol name="archivebox" color={theme.colors.mutedText} size={18} />
              </Pressable>
            </>
          )}
          <Pressable hitSlop={6} accessibilityLabel="Excluir" onPress={() => confirmDelete(c.id)}>
            <IconSymbol name="trash" color={theme.colors.danger} size={18} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <View style={styles.grabber} />

        <View style={styles.header}>
          <Text style={styles.title}>Conversas</Text>
          <Pressable accessibilityLabel="Fechar" onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" color={theme.colors.mutedText} size={22} />
          </Pressable>
        </View>

        <Pressable
          style={styles.newButton}
          onPress={() => {
            onNew();
            onClose();
          }}>
          <IconSymbol name="plus" color={theme.colors.onPrimary} size={18} />
          <Text style={styles.newButtonText}>Nova conversa</Text>
        </Pressable>

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.spinner} />
        ) : isError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Não foi possível carregar as conversas.</Text>
            <Pressable onPress={() => refetch()}>
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {groups.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>Nenhuma conversa ainda.</Text>
              </View>
            ) : (
              groups.map((group) => (
                <View key={group.label} style={styles.group}>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  {group.items.map((c) => renderRow(c, false))}
                </View>
              ))
            )}

            {archivedItems.length > 0 ? (
              <View style={styles.group}>
                <Pressable
                  style={styles.archivedToggle}
                  onPress={() => setShowArchived((v) => !v)}>
                  <Text style={styles.groupLabel}>Arquivadas ({archivedItems.length})</Text>
                  <IconSymbol
                    name="chevron.right"
                    color={theme.colors.subtleText}
                    size={16}
                    style={{ transform: [{ rotate: showArchived ? '90deg' : '0deg' }] }}
                  />
                </Pressable>
                {showArchived ? archivedItems.map((c) => renderRow(c, true)) : null}
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      maxHeight: '78%',
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text,
    },
    newButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    newButtonText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.onPrimary,
    },
    spinner: { marginVertical: theme.spacing.xl },
    stateBox: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
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
    list: { flexGrow: 0 },
    group: { marginBottom: theme.spacing.md },
    groupLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.subtleText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs,
    },
    archivedToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    itemActive: { backgroundColor: theme.colors.primarySoft },
    itemMain: { flex: 1, paddingVertical: theme.spacing.xs },
    itemTitle: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    renameInput: {
      flex: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.primary,
      paddingVertical: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    itemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
  });
