import 'react-native-reanimated';

import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useProtectedRoute } from '@/features/auth/useProtectedRoute';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { useThemeMode } from '@/hooks/useThemeMode';
import { queryClient } from '@/services/queryClient';

void SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { colorMode, theme } = useThemeMode();
  const { status } = useAuth();
  useProtectedRoute();

  if (status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutInner />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
