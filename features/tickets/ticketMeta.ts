import type { TicketEventType, TicketPriority, TicketStatus } from '@/services/api/types';

// Semantic tone → resolves to `${tone}Bg` / `${tone}Fg` tokens in theme/colors.ts.
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_user: 'Aguardando cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

export const STATUS_TONE: Record<TicketStatus, Tone> = {
  open: 'info',
  in_progress: 'warning',
  waiting_user: 'info',
  resolved: 'success',
  closed: 'neutral',
};

export const STATUS_ORDER: TicketStatus[] = ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'];

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Urgente',
};

export const PRIORITY_TONE: Record<TicketPriority, Tone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

export const PRIORITY_ORDER: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

export const EVENT_LABEL: Record<TicketEventType, string> = {
  STATUS_CHANGE: 'Mudança de status',
  PRIORITY_CHANGE: 'Mudança de prioridade',
  ASSIGNED: 'Atribuição',
  NOTE: 'Nota interna',
  REPLY: 'Resposta',
};

// 4 quick-reply templates ported from the Angular ticket composer.
export const REPLY_TEMPLATES: { label: string; body: string }[] = [
  {
    label: 'Saudação',
    body: 'Olá! Obrigado por entrar em contato. Estou analisando seu chamado e retorno em breve.',
  },
  {
    label: 'Pedir informações',
    body: 'Para avançarmos, você poderia nos enviar mais detalhes? (passos para reproduzir, prints e horário em que ocorreu).',
  },
  {
    label: 'Solução temporária',
    body: 'Enquanto trabalhamos na solução definitiva, sugiro a seguinte alternativa temporária:',
  },
  {
    label: 'Confirmação',
    body: 'O problema foi resolvido. Pode confirmar se está tudo funcionando do seu lado? Em caso positivo, encerraremos o chamado.',
  },
];
