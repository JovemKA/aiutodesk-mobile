import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthUser } from '@/services/api/types';

// SecureStore keys must be alphanumeric with ".", "-" and "_".
const TOKEN_KEY = 'aiutodesk.jwt';
const USER_KEY = 'aiutodesk.user';

// expo-secure-store is unavailable on web; fall back to AsyncStorage there.
const isWeb = Platform.OS === 'web';

async function secureGet(key: string): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}
async function secureSet(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}
async function secureDelete(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// In-memory mirror so the axios interceptor can read the token synchronously.
let currentToken: string | null = null;

export function getToken(): string | null {
  return currentToken;
}

export async function loadSession(): Promise<{ token: string | null; user: AuthUser | null }> {
  let token: string | null = null;
  let user: AuthUser | null = null;
  try {
    token = await secureGet(TOKEN_KEY);
    const rawUser = await secureGet(USER_KEY);
    user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  } catch {
    token = null;
    user = null;
  }
  currentToken = token;
  return { token, user };
}

export async function saveSession(token: string, user: AuthUser): Promise<void> {
  currentToken = token;
  await secureSet(TOKEN_KEY, token);
  await secureSet(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  currentToken = null;
  await secureDelete(TOKEN_KEY);
  await secureDelete(USER_KEY);
}
