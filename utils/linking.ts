import { Linking } from 'react-native';

export const openExternalLink = async (url: string): Promise<void> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  } catch {
    // No-op to avoid throwing from UI handlers.
  }
};
