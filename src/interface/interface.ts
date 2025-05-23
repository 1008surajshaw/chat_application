export interface Chat {
  id: string;
  title: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  unreadCount?: number;
  status?: string;
  isGroup: boolean;
  labels: string[];
}

export interface UserProfile {
    id: string;
    name: string;
    avatar_url?: string;
    email: string;
  }
  
  export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    type: string;
    sent_at: string;
  }
  
  export interface RawChat {
    id: string;
    chat_name: string;
    is_group: boolean;
    created_by: string;
    created_at: string;
  }
  
  export interface ChatPreview {
    id: string;
    title: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unread: boolean;
    isGroup: boolean;
    labels: string[];
  }
  