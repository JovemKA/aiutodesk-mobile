import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

export type SheetOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type OptionSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  options: SheetOption<T>[];
  selectedValue?: T | null;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function OptionSheet<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.list} bounces={false}>
          {options.map((opt) => {
            const selected = opt.value === selectedValue;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  {opt.description ? <Text style={styles.optionDescription}>{opt.description}</Text> : null}
                </View>
                {selected ? <IconSymbol name="checkmark" color={theme.colors.primary} size={20} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      maxHeight: '70%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    list: {
      flexGrow: 0,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    optionPressed: {
      opacity: 0.7,
    },
    optionText: {
      flex: 1,
      gap: 2,
    },
    optionLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    optionDescription: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
  });
