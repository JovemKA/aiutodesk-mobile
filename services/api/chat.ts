import { fetch as expoFetch } from 'expo/fetch';

import { api } from '@/services/api/client';
import { API_URL } from '@/services/config';
import { getToken } from '@/services/api/tokenStore';
import type {
  AskChatPayload,
  AskChatResponse,
  ChatConversation,
  ConversationHistoryMessage,
  ChatSource,
} from '@/services/api/types';

export async function askChat(payload: AskChatPayload): Promise<AskChatResponse> {
  const { data } = await api.post<AskChatResponse>('/chat/ask', payload);
  return data;
}

export type ChatStreamMeta = {
  shouldEscalate: boolean;
  escalatedTicketId?: string;
  conversationId: string;
  sources?: ChatSource[];
};

type StreamCallbacks = {
  onToken: (text: string) => void;
  onMeta: (meta: ChatStreamMeta) => void;
};

/**
 * Streams an assistant reply token-by-token from POST /chat/stream (SSE).
 * Uses expo/fetch (the global fetch in RN does not expose a readable body).
 * The axios auth interceptor does not apply here, so we attach the bearer
 * token manually. Throws on transport/HTTP errors so callers can fall back
 * to the one-shot askChat().
 */
export async function streamChat(
  payload: AskChatPayload,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const token = getToken();
  const res = await expoFetch(`${API_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`stream failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flushEvent = (block: string) => {
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const raw = trimmed.slice(5).trim();
      if (!raw) continue;
      let evt: { type: string; text?: string; message?: string } & Partial<ChatStreamMeta>;
      try {
        evt = JSON.parse(raw);
      } catch {
        continue;
      }
      if (evt.type === 'token' && evt.text) {
        callbacks.onToken(evt.text);
      } else if (evt.type === 'meta') {
        callbacks.onMeta({
          shouldEscalate: Boolean(evt.shouldEscalate),
          escalatedTicketId: evt.escalatedTicketId,
          conversationId: evt.conversationId as string,
          sources: evt.sources,
        });
      } else if (evt.type === 'error') {
        throw new Error(evt.message ?? 'Erro no streaming do chat');
      }
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE events are separated by a blank line (\n\n).
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      flushEvent(block);
    }
  }
  if (buffer.trim()) flushEvent(buffer);
}

export async function listConversations(params?: {
  archived?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ChatConversation[]> {
  const { data } = await api.get<ChatConversation[]>('/chat/conversations', { params });
  return data;
}

export async function getConversationMessages(
  conversationId: string,
): Promise<ConversationHistoryMessage[]> {
  const { data } = await api.get<ConversationHistoryMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  );
  return data;
}

// PATCH expects { title? } and/or { archived: boolean } (NOT archivedAt).
export async function updateConversation(
  id: string,
  body: { title?: string; archived?: boolean },
): Promise<void> {
  await api.patch(`/chat/conversations/${id}`, body);
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/chat/conversations/${id}`);
}
