import { getUserChats, getChatMessages, findUserById } from "@/actions/chat";
import { getUserProfile } from "@/actions/auth";
import { supabase } from "@/utils/supabase";
import { ChatPreview } from "@/interface/interface";



export async function fetchUserChats(): Promise<ChatPreview[]> {
  try {
    const currentUser = await getUserProfile();
    if (!currentUser) {
      console.error("No current user profile");
      return [];
    }

    const backendChats = await getUserChats();
    console.log("backendChats", backendChats);
    const previews: ChatPreview[] = [];

    for (const chat of backendChats) {
      let title = chat.chat_name;
      let avatar = "/placeholder.svg?height=48&width=48";

      if (!chat.is_group) {
        const { data: members, error } = await supabase
          .from("chat_members")
          .select("user_id")
          .eq("chat_id", chat.id);

        if (error || !members) continue;

        const otherUserId = members.find(m => m.user_id !== currentUser.id)?.user_id;
        if (otherUserId) {
          const otherUser = await getUserProfile(otherUserId);
          console.log("otherUser", otherUser);
          if (otherUser) {
            title = otherUser.name || "Unknown User";
            avatar = otherUser.avatar_url || avatar;
          }
        }
      } else {
        title = chat.chat_name || "Group Chat";
        avatar = `https://api.dicebear.com/5.x/initials/svg?seed=${title}`;
      }

      const messages = await getChatMessages(chat.id);
      const lastMessage = messages.sort((a, b) =>
        //@ts-ignore
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      )[0];
      
      // Fetch labels for this chat
      const { data: labelData, error: labelError } = await supabase
        .from('chat_labels')
        .select('labels(label_name)')
        .eq('chat_id', chat.id);
      
      const labels = labelError || !labelData ? [] : 
      //@ts-ignore
        labelData.map(item => item.labels.label_name);

      previews.push({
        id: chat.id,
        title,
        avatar,
        lastMessage: lastMessage?.content || "No messages yet",
        lastMessageTime: lastMessage ? formatMessageTime(lastMessage.sent_at) : "Just now",
        unread: false,
        isGroup: chat.is_group,
        labels
      });
    }

    return previews;
  } catch (error) {
    console.error("Failed to fetch user chats:", error);
    return [];
  }
}



// Helper function to format message time
function formatMessageTime(timestamp: string | undefined): string {
  if (!timestamp) return "Just now";
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // Check if the message is from today
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Check if the message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  // Check if the message is from this week
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  if (messageDate > weekAgo) {
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  }
  
  // Otherwise, return the date
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
}



export async function searchContacts(query: string): Promise<any[]> {
  // Implement contact search using the backend API
  // This would call your SearchUserProfile function
  return [];
}

// Add this function to fetch labels for a chat
export async function getChatLabels(chatId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('chat_labels')
      .select('labels(label_name, color)')
      .eq('chat_id', chatId);
    
    if (error) {
      console.error('Error fetching chat labels:', error);
      return [];
    }
    //@ts-ignore
    return data?.map(item => item.labels.label_name) || [];
  } catch (error) {
    console.error('Failed to fetch chat labels:', error);
    return [];
  }
}
