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
