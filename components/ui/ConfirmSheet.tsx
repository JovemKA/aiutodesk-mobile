import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Bottom-sheet confirmation dialog (mirrors the web ConfirmDialog). */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive,
  loading,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.center} pointerEvents="box-none">
        <View style={[styles.card, { marginBottom: insets.bottom }]}>
          <Text style={[styles.title, destructive ? styles.titleDanger : null]}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, destructive ? styles.confirmDanger : styles.confirm, loading ? styles.disabled : null]}
              onPress={onConfirm}
              disabled={loading}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
    titleDanger: { color: theme.colors.danger },
    message: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
      lineHeight: theme.typography.lineHeight.md,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    button: {
      borderRadius: 10,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancel: { backgroundColor: theme.colors.surfaceMuted },
    cancelText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    confirm: { backgroundColor: theme.colors.primary },
    confirmDanger: { backgroundColor: theme.colors.danger },
    confirmText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.onPrimary,
    },
    disabled: { opacity: 0.5 },
  });
