import { useAuthStore } from '@/features/auth/authStore';

/** Stable-shape selector over the Zustand auth store. */
export const useAuth = () => ({
  status: useAuthStore((s) => s.status),
  user: useAuthStore((s) => s.user),
  login: useAuthStore((s) => s.login),
  signup: useAuthStore((s) => s.signup),
  logout: useAuthStore((s) => s.logout),
});
