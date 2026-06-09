import { Stack } from 'expo-router';
import React from 'react';

import { DrawerProvider } from '@/features/navigation/DrawerProvider';

export default function AppLayout() {
  return (
    <DrawerProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </DrawerProvider>
  );
}
