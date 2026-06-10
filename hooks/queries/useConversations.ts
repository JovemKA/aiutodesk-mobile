import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteConversation,
  listConversations,
  updateConversation,
} from '@/services/api/chat';
import type { ChatConversation } from '@/services/api/types';

const KEY = ['conversations'] as const;

export function useConversations(archived = false) {
  return useQuery({
    queryKey: [...KEY, { archived }],
    queryFn: () => listConversations({ archived, limit: 50 }),
  });
}

export function useConversationActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const rename = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateConversation(id, { title }),
    onSuccess: invalidate,
  });
  const archive = useMutation({
    mutationFn: (id: string) => updateConversation(id, { archived: true }),
    onSuccess: invalidate,
  });
  const unarchive = useMutation({
    mutationFn: (id: string) => updateConversation(id, { archived: false }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: invalidate,
  });

  return { rename, archive, unarchive, remove };
}

export type ConversationGroup = { label: string; items: ChatConversation[] };

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function groupConversations(conversations: ChatConversation[]): ConversationGroup[] {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = today - 86_400_000;
  const weekAgo = today - 6 * 86_400_000;

  const buckets: Record<string, ChatConversation[]> = {
    Hoje: [],
    Ontem: [],
    'Esta semana': [],
    Anteriores: [],
  };

  for (const c of conversations) {
    const ts = startOfDay(new Date(c.lastMessageAt ?? c.createdAt));
    if (ts >= today) buckets['Hoje'].push(c);
    else if (ts >= yesterday) buckets['Ontem'].push(c);
    else if (ts >= weekAgo) buckets['Esta semana'].push(c);
    else buckets['Anteriores'].push(c);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
