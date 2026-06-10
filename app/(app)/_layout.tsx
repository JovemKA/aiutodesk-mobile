import { Stack } from 'expo-router';
import React from 'react';

import { DrawerHost } from '@/features/navigation/DrawerProvider';

export default function AppLayout() {
  return (
    <DrawerHost>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </DrawerHost>
  );
}
