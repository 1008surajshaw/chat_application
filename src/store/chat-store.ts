import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatPreview } from '@/interface/interface';
import { fetchUserChats } from '@/services/chat-service';
import { createLabel, addLabelToChat } from '@/actions/chat';
import { supabase } from '@/utils/supabase';

// Define the Label interface if it's not exported from interface.ts
interface Label {
  id: string;
  label_name: string;
  color: string;
}

interface ChatState {
  // Chat data
  chats: ChatPreview[];
  selectedChatId: string | null;
  isLoading: boolean;
  
  // Label data
  labels: Label[];
  isLabelsLoading: boolean;
  
  // Actions
  fetchChats: () => Promise<void>;
  selectChat: (chatId: string | null) => void;
  fetchLabels: () => Promise<void>;
  createNewLabel: (name: string, color: string, chatIds: string[]) => Promise<boolean>;
  addLabelToChats: (labelId: string, chatIds: string[]) => Promise<boolean>;
  filterChatsByLabel: (labelName: string | null) => ChatPreview[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      selectedChatId: null,
      isLoading: false,
      labels: [],
      isLabelsLoading: false,
      
      // Actions
      fetchChats: async () => {
        const { isLoading } = get();
        
        // Prevent multiple simultaneous fetches
        if (isLoading) {
          console.log("Already fetching chats, skipping");
          return;
        }
        
        set({ isLoading: true });
        console.log("Fetching chats from store");
        
        try {
          const chats = await fetchUserChats();
          console.log("Fetched chats:", chats.length);
          set({ chats, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch chats:', error);
          set({ isLoading: false });
        }
      },
      
      selectChat: (chatId: string | null) => {
        set({ selectedChatId: chatId });
      },
      
      fetchLabels: async () => {
        const { isLabelsLoading } = get();
        
        // Prevent multiple simultaneous fetches
        if (isLabelsLoading) {
          return;
        }
        
        set({ isLabelsLoading: true });
        
        try {
          // This would be a separate API call to get all available labels
          const { data, error } = await supabase
            .from('labels')
            .select('*');
            
          if (error) throw error;
          
          set({ labels: data || [], isLabelsLoading: false });
        } catch (error) {
          console.error('Failed to fetch labels:', error);
          set({ isLabelsLoading: false });
        }
      },
      
      createNewLabel: async (name: string, color: string, chatIds: string[]) => {
        try {
          const label = await createLabel(name, color);
          
          if (label) {
            // Add the label to selected chats
            const promises = chatIds.map(chatId => 
              addLabelToChat(chatId, label.id)
            );
            
            await Promise.all(promises);
            
            // Update the store with the new label
            set(state => ({
              labels: [...state.labels, label]
            }));
            
            // Refresh chats to show updated labels
            const { fetchChats } = get();
            await fetchChats();
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error creating label:', error);
          return false;
        }
      },
      
      addLabelToChats: async (labelId: string, chatIds: string[]) => {
        try {
          const promises = chatIds.map(chatId => 
            addLabelToChat(chatId, labelId)
          );
          
          await Promise.all(promises);
          
          // Refresh chats to show updated labels
          const { fetchChats } = get();
          await fetchChats();
          
          return true;
        } catch (error) {
          console.error('Error adding label to chats:', error);
          return false;
        }
      },
      
      filterChatsByLabel: (labelName: string | null) => {
        const { chats } = get();
        
        if (!labelName) return chats;
        
        return chats.filter(chat => 
          chat.labels.includes(labelName)
        );
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ 
        selectedChatId: state.selectedChatId,
        // Don't persist chats and labels as they should be fetched fresh
      }),
    }
  )
);
