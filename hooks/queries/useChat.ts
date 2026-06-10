import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { askChat, getConversationMessages, streamChat } from '@/services/api/chat';
import { getApiErrorMessage } from '@/services/api/client';
import type { ChatSource } from '@/services/api/types';

export type UIChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  escalatedTicketId?: string;
  shouldEscalate?: boolean;
  isStreaming?: boolean;
};

let idCounter = 0;
const nextId = () => `m${Date.now()}-${idCounter++}`;

/**
 * Manages an in-memory chat session. Streams replies token-by-token from
 * POST /chat/stream and falls back to the one-shot POST /chat/ask if the
 * stream fails (network, cold start, unsupported transport).
 */
export function useChat() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  // Reactive state for the UI + a ref for synchronous reads inside async send().
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const conversationIdRef = useRef<string | undefined>(undefined);

  const setConversation = useCallback(
    (id: string | undefined) => {
      const isNew = Boolean(id) && id !== conversationIdRef.current;
      conversationIdRef.current = id;
      setConversationId(id);
      if (isNew) queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    [queryClient],
  );

  const patchMessage = useCallback((id: string, patch: Partial<UIChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      setError(null);
      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed },
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ]);
      setStreaming(true);

      let receivedToken = false;
      try {
        await streamChat(
          { message: trimmed, conversationId: conversationIdRef.current },
          {
            onToken: (chunk) => {
              receivedToken = true;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
              );
            },
            onMeta: (meta) => {
              setConversation(meta.conversationId ?? conversationIdRef.current);
              patchMessage(assistantId, {
                sources: meta.sources,
                shouldEscalate: meta.shouldEscalate,
                escalatedTicketId: meta.escalatedTicketId,
              });
            },
          },
        );
        patchMessage(assistantId, { isStreaming: false });
      } catch {
        // Fallback to the one-shot endpoint if streaming failed and produced nothing.
        try {
          const res = await askChat({ message: trimmed, conversationId: conversationIdRef.current });
          setConversation(res.conversationId ?? conversationIdRef.current);
          patchMessage(assistantId, {
            content: res.answer,
            sources: res.sources,
            shouldEscalate: res.shouldEscalate,
            escalatedTicketId: res.escalatedTicketId,
            isStreaming: false,
          });
        } catch (e) {
          // Drop the empty assistant placeholder and surface the error.
          setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
          patchMessage(assistantId, { isStreaming: false });
          if (!receivedToken) {
            setError(getApiErrorMessage(e, 'Não foi possível obter resposta do assistente.'));
          }
        }
      } finally {
        setStreaming(false);
      }
    },
    [streaming, patchMessage, setConversation],
  );

  const reset = useCallback(() => {
    conversationIdRef.current = undefined;
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setError(null);
    try {
      const history = await getConversationMessages(id);
      conversationIdRef.current = id;
      setConversationId(id);
      setMessages(history.map((m) => ({ id: nextId(), role: m.role, content: m.text })));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Não foi possível carregar a conversa.'));
    }
  }, []);

  return {
    messages,
    send,
    streaming,
    error,
    reset,
    loadConversation,
    conversationId,
  };
}
