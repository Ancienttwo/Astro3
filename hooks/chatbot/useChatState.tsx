"use client";

import { useReducer, useCallback } from 'react';
import { ChatState, ChatActions, Message, MasterType, ErrorState } from '@/types/chatbot';

// 初始状态
const initialState: ChatState = {
  user: null,
  activeMaster: null,
  messages: [],
  isLoading: false,
  error: null,
  inputValue: '',
  showSubscriptionDialog: false,
};

// Action类型
type ChatAction =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_ACTIVE_MASTER'; payload: MasterType | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SET_SHOW_SUBSCRIPTION_DIALOG'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET_STATE' };

// Reducer函数
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
      
    case 'SET_ACTIVE_MASTER':
      return { ...state, activeMaster: action.payload };
      
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
      
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
      
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
      
    case 'SET_SHOW_SUBSCRIPTION_DIALOG':
      return { ...state, showSubscriptionDialog: action.payload };
      
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
      
    case 'RESET_STATE':
      return { ...initialState, user: state.user };
      
    default:
      return state;
  }
}

// 自定义Hook
export function useChatState() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Actions
  const actions: ChatActions = {
    setUser: useCallback((user: any) => {
      dispatch({ type: 'SET_USER', payload: user });
    }, []),

    setActiveMaster: useCallback((master: MasterType | null) => {
      dispatch({ type: 'SET_ACTIVE_MASTER', payload: master });
    }, []),

    addMessage: useCallback((message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    }, []),

    updateMessage: useCallback((id: string, updates: Partial<Message>) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
    }, []),

    setMessages: useCallback((messages: Message[]) => {
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setInputValue: useCallback((value: string) => {
      dispatch({ type: 'SET_INPUT_VALUE', payload: value });
    }, []),

    setShowSubscriptionDialog: useCallback((show: boolean) => {
      dispatch({ type: 'SET_SHOW_SUBSCRIPTION_DIALOG', payload: show });
    }, []),

    clearMessages: useCallback(() => {
      dispatch({ type: 'CLEAR_MESSAGES' });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),
  };

  return {
    state,
    actions,
  };
} 