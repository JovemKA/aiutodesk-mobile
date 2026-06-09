import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { askChat } from '@/services/api/chat';
import { getApiErrorMessage } from '@/services/api/client';
import type { ChatSource } from '@/services/api/types';

export type UIChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  escalatedTicketId?: string;
};

let idCounter = 0;
const nextId = () => `m${Date.now()}-${idCounter++}`;

/** Manages an in-memory chat session backed by POST /chat/ask. */
export function useChat() {
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: (message: string) => askChat({ message, conversationId: conversationId.current }),
  });

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || mutation.isPending) return;

      setError(null);
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);

      try {
        const res = await mutation.mutateAsync(trimmed);
        conversationId.current = res.conversationId ?? conversationId.current;
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: res.answer,
            sources: res.sources,
            escalatedTicketId: res.escalatedTicketId,
          },
        ]);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Não foi possível obter resposta do assistente.'));
      }
    },
    [mutation],
  );

  return {
    messages,
    send,
    sending: mutation.isPending,
    error,
  };
}
