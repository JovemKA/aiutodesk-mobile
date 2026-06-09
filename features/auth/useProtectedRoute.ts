import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/useAuth';

/**
 * Redirects between the (auth) and (app) route groups based on session status.
 * Mounted once in the root layout.
 */
export function useProtectedRoute() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [status, segments, router]);
}
