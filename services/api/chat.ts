import { api } from '@/services/api/client';
import type {
  AskChatPayload,
  AskChatResponse,
  ChatConversation,
  ChatMessage,
} from '@/services/api/types';

export async function askChat(payload: AskChatPayload): Promise<AskChatResponse> {
  const { data } = await api.post<AskChatResponse>('/chat/ask', payload);
  return data;
}

export async function listConversations(params?: {
  archived?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ChatConversation[]> {
  const { data } = await api.get<ChatConversation[]>('/chat/conversations', { params });
  return data;
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
  return data;
}
