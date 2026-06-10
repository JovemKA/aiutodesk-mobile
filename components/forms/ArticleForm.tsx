import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { OptionSheet, type SheetOption } from '@/components/ui/OptionSheet';
import { TextField } from '@/components/ui/TextField';
import { useCategories } from '@/hooks/queries/useCategories';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { ArticleInput } from '@/services/api/types';
import { Theme } from '@/theme';

type ArticleFormProps = {
  initial?: Partial<ArticleInput>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (payload: ArticleInput) => void;
};

export function ArticleForm({ initial, submitLabel, submitting, onSubmit }: ArticleFormProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: categories } = useCategories();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [categoryId, setCategoryId] = useState<string | undefined>(initial?.categoryId);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  const categoryOptions: SheetOption<string>[] = (categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const selectedCategory = categories?.find((c) => c.id === categoryId);

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (title.trim().length < 6) next.title = 'O título deve ter ao menos 6 caracteres.';
    if (content.trim().length < 20) next.content = 'O conteúdo deve ter ao menos 20 caracteres.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      title: title.trim(),
      summary: summary.trim() || undefined,
      content: content.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      categoryId,
      isPublished,
    });
  };

  return (
    <View style={styles.form}>
      <TextField label="Título" value={title} onChangeText={setTitle} placeholder="Título do artigo" error={errors.title} />

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
          <Text style={[styles.selectText, !selectedCategory ? styles.placeholder : null]}>
            {selectedCategory?.name ?? 'Selecionar categoria'}
          </Text>
          <IconSymbol name="chevron.right" color={theme.colors.mutedText} size={18} />
        </Pressable>
      </View>

      <TextField label="Resumo (opcional)" value={summary} onChangeText={setSummary} placeholder="Resumo curto" multiline />
      <TextField
        label="Conteúdo (Markdown)"
        value={content}
        onChangeText={setContent}
        placeholder="Escreva o conteúdo…"
        multiline
        style={styles.contentInput}
        error={errors.content}
      />
      <TextField label="Tags (separadas por vírgula)" value={tags} onChangeText={setTags} placeholder="rede, vpn, senha" autoCapitalize="none" />

      <Pressable style={styles.checkboxRow} onPress={() => setIsPublished((v) => !v)}>
        <View style={[styles.checkbox, isPublished ? styles.checkboxOn : null]}>
          {isPublished ? <IconSymbol name="checkmark" color={theme.colors.onPrimary} size={14} /> : null}
        </View>
        <Text style={styles.checkboxLabel}>Publicado</Text>
      </Pressable>

      <AppButton label={submitLabel} onPress={handleSubmit} loading={submitting} />

      <OptionSheet
        visible={pickerOpen}
        title="Categoria"
        options={categoryOptions}
        selectedValue={categoryId ?? null}
        onSelect={(v) => setCategoryId(v)}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    form: { gap: theme.spacing.md },
    field: { gap: theme.spacing.xs },
    label: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    select: {
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
    selectText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    placeholder: { color: theme.colors.mutedText },
    contentInput: { minHeight: 140, textAlignVertical: 'top' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    checkboxLabel: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
  });
