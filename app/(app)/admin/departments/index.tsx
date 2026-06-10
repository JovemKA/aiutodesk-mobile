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
import { useDepartmentActions, useDepartments } from '@/hooks/queries/useDepartments';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { Department } from '@/services/api/types';
import { Theme } from '@/theme';

export default function AdminDepartmentsScreen() {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, isError, error, refetch } = useDepartments();
  const { create, update, remove } = useDepartmentActions();

  const [editing, setEditing] = useState<Department | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Department | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setCostCenter('');
    setFormError(null);
    setOpen(true);
  };
  const openEdit = (d: Department) => {
    setEditing(d);
    setName(d.name);
    setCostCenter(d.costCenter ?? '');
    setFormError(null);
    setOpen(true);
  };

  const submit = async () => {
    const value = name.trim();
    if (!value) {
      setFormError('Informe um nome.');
      return;
    }
    const payload = { name: value, costCenter: costCenter.trim() || undefined };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else await create.mutateAsync(payload);
      setOpen(false);
    } catch (e) {
      setFormError(getApiErrorMessage(e, 'Não foi possível salvar.'));
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <ScreenLayout title="Departamentos" subtitle="Gerenciar departamentos">
      <AppButton label="Novo departamento" onPress={openCreate} />

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
          <Text style={styles.stateText}>Nenhum departamento cadastrado.</Text>
        </View>
      ) : (
        (data ?? []).map((d) => (
          <View key={d.id} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.itemName}>{d.name}</Text>
              {d.costCenter ? <Text style={styles.itemSub}>Centro de custo: {d.costCenter}</Text> : null}
            </View>
            <View style={styles.itemActions}>
              <Pressable hitSlop={6} accessibilityLabel="Editar" onPress={() => openEdit(d)}>
                <IconSymbol name="pencil" color={theme.colors.mutedText} size={20} />
              </Pressable>
              <Pressable hitSlop={6} accessibilityLabel="Excluir" onPress={() => setToDelete(d)}>
                <IconSymbol name="trash" color={theme.colors.danger} size={20} />
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{editing ? 'Editar departamento' : 'Novo departamento'}</Text>
          <TextField label="Nome" value={name} onChangeText={setName} placeholder="Ex: TI" autoFocus error={formError ?? undefined} />
          <TextField label="Centro de custo (opcional)" value={costCenter} onChangeText={setCostCenter} placeholder="Ex: CC-1001" />
          <AppButton label={editing ? 'Salvar' : 'Criar'} onPress={submit} loading={saving} />
        </View>
      </Modal>

      <ConfirmSheet
        visible={!!toDelete}
        title="Excluir departamento"
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
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    itemText: { flex: 1, gap: 2 },
    itemName: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    itemSub: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
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
