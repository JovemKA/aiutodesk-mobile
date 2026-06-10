import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as ticketsApi from '@/services/api/tickets';
import type { CreateTicketPayload, ReplyTicketPayload, TicketFilters, TicketPriority, TicketStatus } from '@/services/api/types';

export const ticketKeys = {
  all: ['tickets'] as const,
  list: (filters: TicketFilters) => ['tickets', 'list', filters] as const,
  detail: (id: string) => ['tickets', id] as const,
  messages: (id: string) => ['tickets', id, 'messages'] as const,
  events: (id: string) => ['tickets', id, 'events'] as const,
  assignable: (id: string) => ['tickets', id, 'assignable'] as const,
};

export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ticketKeys.list(filters),
    queryFn: () => ticketsApi.listTickets(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.getTicket(id),
    enabled: Boolean(id),
  });
}

export function useTicketMessages(id: string) {
  return useQuery({
    queryKey: ticketKeys.messages(id),
    queryFn: () => ticketsApi.getMessages(id),
    enabled: Boolean(id),
  });
}

export function useTicketEvents(id: string) {
  return useQuery({
    queryKey: ticketKeys.events(id),
    queryFn: () => ticketsApi.getEvents(id),
    enabled: Boolean(id),
  });
}

export function useAssignableUsers(id: string, enabled = true) {
  return useQuery({
    queryKey: ticketKeys.assignable(id),
    queryFn: () => ticketsApi.getAssignableUsers(id),
    enabled: Boolean(id) && enabled,
  });
}

// --- Mutations ----------------------------------------------------------

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketsApi.createTicket(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

/** Invalidates a ticket's detail, list, and timeline after a write. */
function useTicketWrite<TArgs>(fn: (id: string, args: TArgs) => Promise<unknown>, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: TArgs) => fn(id, args),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.events(id) });
      qc.invalidateQueries({ queryKey: ['tickets', 'list'] });
    },
  });
}

export function useChangeStatus(id: string) {
  return useTicketWrite<TicketStatus>((tid, status) => ticketsApi.changeStatus(tid, status), id);
}

export function useChangePriority(id: string) {
  return useTicketWrite<TicketPriority>((tid, priority) => ticketsApi.changePriority(tid, priority), id);
}

export function useAssignTicket(id: string) {
  return useTicketWrite<string | null>((tid, userId) => ticketsApi.assignTicket(tid, userId), id);
}

export function useReplyTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReplyTicketPayload) => ticketsApi.replyTicket(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.messages(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.events(id) });
    },
  });
}

export function useTicketAssist(id: string) {
  return useMutation({
    mutationFn: (query?: string) => ticketsApi.assistTicket(id, 'suggest_reply', query),
  });
}

export function useUpdateTicket(id: string) {
  return useTicketWrite<Partial<CreateTicketPayload>>(
    (tid, payload) => ticketsApi.updateTicket(tid, payload),
    id,
  );
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketsApi.deleteTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}
