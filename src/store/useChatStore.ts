import { create } from 'zustand';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  song_id?: string;
  is_read: boolean;
  created_at: Date;
}

interface ChatState {
  messages: Record<string, Message[]>; // key: userId
  activeChat: string | null;
  unreadCount: Record<string, number>;
  isTyping: Record<string, boolean>;

  setActiveChat: (userId: string | null) => void;
  addMessage: (userId: string, message: Message) => void;
  setMessages: (userId: string, messages: Message[]) => void;
  markAsRead: (userId: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  incrementUnread: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  activeChat: null,
  unreadCount: {},
  isTyping: {},

  setActiveChat: (userId) => set({ activeChat: userId }),

  addMessage: (userId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [...(state.messages[userId] || []), message],
      },
    })),

  setMessages: (userId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: messages,
      },
    })),

  markAsRead: (userId) =>
    set((state) => ({
      unreadCount: {
        ...state.unreadCount,
        [userId]: 0,
      },
    })),

  setTyping: (userId, isTyping) =>
    set((state) => ({
      isTyping: {
        ...state.isTyping,
        [userId]: isTyping,
      },
    })),

  incrementUnread: (userId) =>
    set((state) => ({
      unreadCount: {
        ...state.unreadCount,
        [userId]: (state.unreadCount[userId] || 0) + 1,
      },
    })),
}));
