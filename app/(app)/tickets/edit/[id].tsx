import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { AppButton } from '@/components/ui/AppButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { OptionSheet, type SheetOption } from '@/components/ui/OptionSheet';
import { TextField } from '@/components/ui/TextField';
import { PRIORITY_LABEL, PRIORITY_ORDER } from '@/features/tickets/ticketMeta';
import { useCategories } from '@/hooks/queries/useCategories';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useTicket, useUpdateTicket } from '@/hooks/queries/useTickets';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { TicketPriority } from '@/services/api/types';
import { Theme } from '@/theme';

export default function EditTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const { data: ticket, isLoading } = useTicket(id);
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const update = useUpdateTicket(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | 'department' | 'priority' | 'category'>(null);

  // Prefill once the ticket loads.
  useEffect(() => {
    if (!ticket) return;
    setTitle(ticket.title);
    setDescription(ticket.description);
    setPriority(ticket.priority);
    setDepartmentId(ticket.department?.id);
    setCategoryId(ticket.category?.id);
  }, [ticket]);

  const departmentName = departments?.find((d) => d.id === departmentId)?.name;
  const categoryName = categories?.find((c) => c.id === categoryId)?.name;

  const handleSubmit = async () => {
    if (title.trim().length < 6) return setError('O assunto precisa de ao menos 6 caracteres.');
    if (description.trim().length < 20) return setError('A descrição precisa de ao menos 20 caracteres.');
    setError(null);
    try {
      await update.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        priority,
        department_id: departmentId,
        category_id: categoryId,
      });
      router.back();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Não foi possível salvar o chamado.'));
    }
  };

  return (
    <ScreenLayout title="Editar chamado">
      <Pressable style={styles.back} onPress={() => router.back()}>
        <IconSymbol name="chevron.right" color={theme.colors.primary} size={18} style={styles.backIcon} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      {isLoading || !ticket ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            <TextField label="Assunto" value={title} onChangeText={setTitle} placeholder="Assunto do chamado" />
            <Selector label="Departamento" value={departmentName ?? 'Selecionar'} onPress={() => setSheet('department')} />
            <Selector label="Prioridade" value={PRIORITY_LABEL[priority]} onPress={() => setSheet('priority')} />
            <Selector label="Categoria (opcional)" value={categoryName ?? 'Selecionar'} onPress={() => setSheet('category')} />
            <TextField
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o chamado…"
              multiline
              numberOfLines={6}
              style={styles.textarea}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AppButton label="Salvar alterações" onPress={handleSubmit} loading={update.isPending} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <OptionSheet
        visible={sheet === 'department'}
        title="Departamento"
        options={(departments ?? []).map((d) => ({ value: d.id, label: d.name }))}
        selectedValue={departmentId ?? null}
        onSelect={(v) => setDepartmentId(v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet<TicketPriority>
        visible={sheet === 'priority'}
        title="Prioridade"
        options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] })) as SheetOption<TicketPriority>[]}
        selectedValue={priority}
        onSelect={(v) => setPriority(v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'category'}
        title="Categoria"
        options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
        selectedValue={categoryId ?? null}
        onSelect={(v) => setCategoryId(v)}
        onClose={() => setSheet(null)}
      />
    </ScreenLayout>
  );
}

function Selector({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.selectorWrap}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Pressable style={styles.selector} onPress={onPress}>
        <Text style={styles.selectorValue}>{value}</Text>
        <IconSymbol name="chevron.right" color={theme.colors.mutedText} size={18} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    form: { gap: theme.spacing.md, paddingBottom: theme.spacing.xl, paddingTop: theme.spacing.md },
    back: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    backIcon: { transform: [{ rotate: '180deg' }] },
    backText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    textarea: { minHeight: 120, textAlignVertical: 'top' },
    selectorWrap: { gap: theme.spacing.xs },
    selectorLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    selectorValue: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    error: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.danger,
    },
  });
