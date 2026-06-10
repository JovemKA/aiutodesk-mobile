import { useDrawerStore } from '@/features/navigation/drawerStore';

/** Stable-shape selector over the Zustand drawer store. */
export const useDrawer = () => ({
  isOpen: useDrawerStore((s) => s.isOpen),
  open: useDrawerStore((s) => s.open),
  close: useDrawerStore((s) => s.close),
});
