import { api } from '@/services/api/client';
import type {
  AssignableUser,
  AssistResult,
  CreateTicketPayload,
  ReplyTicketPayload,
  Ticket,
  TicketEvent,
  TicketFilters,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from '@/services/api/types';

export async function listTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  const { data } = await api.get<Ticket[]>('/tickets', { params: filters });
  return data;
}

export async function getTicket(id: string): Promise<Ticket> {
  const { data } = await api.get<Ticket>(`/tickets/${id}`);
  return data;
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const { data } = await api.post<Ticket>('/tickets', payload);
  return data;
}

export async function updateTicket(
  id: string,
  payload: Partial<CreateTicketPayload>,
): Promise<Ticket> {
  const { data } = await api.patch<Ticket>(`/tickets/${id}`, payload);
  return data;
}

export async function deleteTicket(id: string): Promise<void> {
  await api.delete(`/tickets/${id}`);
}

export async function getAssignableUsers(id: string): Promise<AssignableUser[]> {
  const { data } = await api.get<AssignableUser[]>(`/tickets/${id}/assignable-users`);
  return data;
}

export async function changeStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const { data } = await api.patch<Ticket>(`/tickets/${id}/status`, { status });
  return data;
}

export async function assignTicket(id: string, assignedUserId: string | null): Promise<Ticket> {
  const { data } = await api.patch<Ticket>(`/tickets/${id}/assign`, {
    assigned_user_id: assignedUserId,
  });
  return data;
}

export async function changePriority(id: string, priority: TicketPriority): Promise<Ticket> {
  const { data } = await api.patch<Ticket>(`/tickets/${id}`, { priority });
  return data;
}

export async function getMessages(id: string): Promise<TicketMessage[]> {
  const { data } = await api.get<TicketMessage[]>(`/tickets/${id}/messages`);
  return data;
}

export async function replyTicket(id: string, payload: ReplyTicketPayload): Promise<TicketMessage> {
  const { data } = await api.post<TicketMessage>(`/tickets/${id}/messages`, payload);
  return data;
}

export async function getEvents(id: string): Promise<TicketEvent[]> {
  const { data } = await api.get<TicketEvent[]>(`/tickets/${id}/events`);
  return data;
}

export async function assistTicket(
  id: string,
  intent: 'suggest_reply' | 'summary' = 'suggest_reply',
  query?: string,
): Promise<AssistResult> {
  const { data } = await api.post<AssistResult>(`/tickets/${id}/assist`, { intent, query });
  return data;
}
