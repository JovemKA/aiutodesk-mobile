import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenLayout } from '@/components/ScreenLayout';
import { AppButton } from '@/components/ui/AppButton';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TextField } from '@/components/ui/TextField';
import { useCategories, useCategoryActions } from '@/hooks/queries/useCategories';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { Category } from '@/services/api/types';
import { Theme } from '@/theme';

export default function AdminCategoriesScreen() {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, isError, error, refetch } = useCategories();
  const { create, update, remove } = useCategoryActions();

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setFormError(null);
    setCreating(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setFormError(null);
    setCreating(true);
  };

  const submit = async () => {
    const value = name.trim();
    if (!value) {
      setFormError('Informe um nome.');
      return;
    }
    try {
      if (editing) await update.mutateAsync({ id: editing.id, name: value });
      else await create.mutateAsync(value);
      setCreating(false);
    } catch (e) {
      setFormError(getApiErrorMessage(e, 'Não foi possível salvar.'));
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <ScreenLayout title="Categorias" subtitle="Gerenciar categorias">
      <AppButton label="Nova categoria" onPress={openCreate} />

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{getApiErrorMessage(error, 'Erro ao carregar.')}</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (data ?? []).length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Nenhuma categoria cadastrada.</Text>
        </View>
      ) : (
        (data ?? []).map((c) => (
          <View key={c.id} style={styles.item}>
            <Text style={styles.itemName}>{c.name}</Text>
            <View style={styles.itemActions}>
              <Pressable hitSlop={6} accessibilityLabel="Editar" onPress={() => openEdit(c)}>
                <IconSymbol name="pencil" color={theme.colors.mutedText} size={20} />
              </Pressable>
              <Pressable hitSlop={6} accessibilityLabel="Excluir" onPress={() => setToDelete(c)}>
                <IconSymbol name="trash" color={theme.colors.danger} size={20} />
              </Pressable>
            </View>
          </View>
        ))
      )}

      {/* Create/Edit form */}
      <Modal visible={creating} transparent animationType="slide" onRequestClose={() => setCreating(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCreating(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{editing ? 'Editar categoria' : 'Nova categoria'}</Text>
          <TextField label="Nome" value={name} onChangeText={setName} placeholder="Ex: Rede" autoFocus error={formError ?? undefined} />
          <AppButton label={editing ? 'Salvar' : 'Criar'} onPress={submit} loading={saving} />
        </View>
      </Modal>

      <ConfirmSheet
        visible={!!toDelete}
        title="Excluir categoria"
        message={toDelete ? `Excluir "${toDelete.name}"? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (toDelete) await remove.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
        onClose={() => setToDelete(null)}
      />
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    itemName: {
      flex: 1,
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    itemActions: { flexDirection: 'row', gap: theme.spacing.lg },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    sheetTitle: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
  });
