// Domain types mirroring the AiutoDesk NestJS backend contracts.

export type UserRole = 'user' | 'dev' | 'master' | 'admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

// --- Chat ---------------------------------------------------------------

export type ChatSource = {
  id: string;
  title: string;
  slug: string;
  similarity: number;
};

export type AskChatPayload = {
  message: string;
  conversationId?: string;
};

export type AskChatResponse = {
  answer: string;
  sources: ChatSource[];
  shouldEscalate: boolean;
  escalatedTicketId?: string;
  conversationId: string;
};

export type ChatConversation = {
  id: string;
  title: string | null;
  lastMessageAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

// --- Knowledge base -----------------------------------------------------

export type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  tags: string[] | null;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

// --- Tickets ------------------------------------------------------------

export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketEventType = 'STATUS_CHANGE' | 'PRIORITY_CHANGE' | 'ASSIGNED' | 'NOTE' | 'REPLY';

export type Department = {
  id: string;
  name: string;
  costCenter?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

// User as populated inside ticket relations (mirrors backend safeUser).
export type TicketUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  priorityScore: number | null;
  priorityReason: string | null;
  scoreConfidence: string | null;
  requester: TicketUser;
  assignedUser: TicketUser | null;
  department: Department | null;
  category: Category | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketAttachment = { name: string; size: number; url: string };

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorId: string | null;
  authorRole: 'requester' | 'agent' | 'system';
  body: string;
  createdAt: string;
  internalNote: boolean;
  attachments?: TicketAttachment[];
};

export type TicketEvent = {
  id: string;
  type: TicketEventType;
  actor: TicketUser | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AssignableUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AssistResult = {
  suggestion: string;
  referencedTickets: { ticketId: string; title: string }[];
};

// Input DTOs
export type TicketFilters = {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  departmentId?: string;
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  priority?: TicketPriority;
  category_id?: string;
  department_id?: string;
};

export type ReplyTicketPayload = {
  body: string;
  internalNote?: boolean;
};
