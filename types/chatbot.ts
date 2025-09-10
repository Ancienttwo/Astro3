// Chatbot相关类型定义
import type { UnifiedUser, UserUsage } from './user';

export type MasterType = 'ziwei' | 'bazi';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  metadata?: {
    masterType?: MasterType;
    conversationId?: string;
    characterCount?: number;
    processingTime?: number;
  };
}

export interface Master {
  name: string;
  title: string;
  avatar: string;
  color: string;
  welcome: string;
  apiEndpoint: string;
  agentType: string;
}

export interface ChatState {
  user: UnifiedUser | null;
  activeMaster: MasterType | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  inputValue: string;
  showSubscriptionDialog: boolean;
}

export interface ChatActions {
  setUser: (user: UnifiedUser | null) => void;
  setActiveMaster: (master: MasterType | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInputValue: (value: string) => void;
  setShowSubscriptionDialog: (show: boolean) => void;
  clearMessages: () => void;
  resetState: () => void;
}

export interface ChatHistory {
  loadHistory: (masterType: MasterType) => Promise<Message[]>;
  saveMessage: (message: Message, masterType: MasterType) => Promise<void>;
  clearHistory: (masterType: MasterType) => Promise<void>;
}

export interface ChatAuth {
  user: UnifiedUser | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<boolean>;
  getUserUsage: () => Promise<UserUsage>;
}

export interface ErrorState {
  type: 'network' | 'auth' | 'validation' | 'quota' | 'server' | 'unknown';
  message: string;
  code?: string;
  retryable?: boolean;
  timestamp: Date;
}

export interface LoadingState {
  chat: boolean;
  history: boolean;
  auth: boolean;
  usage: boolean;
} 