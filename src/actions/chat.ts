import { getSession } from '@/utils/auth';
import { supabase } from '@/utils/supabase';

// Define interfaces for better type safety
interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at?: string;
}

interface Chat {
  id: string;
  chat_name: string;
  is_group: boolean;
  created_by: string;
  created_at?: string;
}

interface ChatMember {
  id?: string;
  chat_id: string;
  user_id: string;
  is_admin?: boolean;
  joined_at?: string;
}

interface Message {
  id?: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type?: string;
  sent_at?: string;
  sender?: UserProfile;
}

interface Label {
  id: string;
  label_name: string;
  color: string;
}

interface ChatLabel {
  chat_id: string;
  label_id: string;
}

interface Assignment {
  chat_id: string;
  assigned_to: string;
  assigned_by: string;
}

/**
 * Search for user profiles by name
 * @param searchQuery The search query string
 * @returns Array of matching user profiles
 */
export const SearchUserProfile = async (searchQuery: string): Promise<UserProfile[]> => {
  try {

    const session = await getSession();
    if (!session) {
      console.error('Not authenticated');
      return [];
    }
    console.log("session.user.id", session.user.id);
    console.log("searchQuery", searchQuery);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .neq('id', session.user.id);



    if (error) {
      console.error('Failed to search user profile:', error);
      return [];
    }
    
    console.log('User profile searched successfully!');
    return data as UserProfile[];
  } catch (error) {
    console.error('Error in SearchUserProfile:', error);
    return [];
  }
};

/**
 * Find a user profile by ID
 * @param userId The user ID to find
 * @returns The user profile or null if not found
 */
export const findUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to find user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error in findUserById:', error);
    return null;
  }
};

export const addUsersToChat = async (chatId: string, userIds: string[]): Promise<boolean> => {
  try {
    if (!chatId || !userIds || userIds.length === 0) {
      console.error('Invalid parameters for addUsersToChat');
      return false;
    }
    
    const chatMembers = userIds.map((userId) => ({
      chat_id: chatId,
      user_id: userId,
    }));
    
    const { error } = await supabase
      .from('chat_members')
      .insert(chatMembers);

    if (error) {
      console.error('Failed to add users to chat:', error);
      return false;
    }
    
    console.log('Users added to chat successfully!');
    return true;
  } catch (error) {
    console.error('Error in addUsersToChat:', error);
    return false;
  }
};


export const sendMessage = async (
  chatId: string, 
  content: string, 
  senderId?: string
): Promise<Message | null> => {
  try {
    if (!chatId || !content) {
      console.error('Invalid parameters for sendMessage');
      return null;
    }
    
    // Get current user if senderId not provided
    if (!senderId) {
      const session = await getSession();
      if (!session) {
        console.error('Not authenticated');
        return null;
      }
      senderId = session.user.id;
    }
    
    const message = {
      chat_id: chatId,
      sender_id: senderId,
      content: content,
      type: 'text', // Default type
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to send message:', error);
      return null;
    }
    
    console.log('Message sent successfully!');
    return data as Message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};


export const addLabelToChat = async (chatId: string, labelId: string): Promise<boolean> => {
  try {
    if (!chatId || !labelId) {
      console.error('Invalid parameters for addLabelToChat');
      return false;
    }
    
    const { error } = await supabase
      .from('chat_labels')
      .insert({
        chat_id: chatId,
        label_id: labelId,
      });

    if (error) {
      console.error('Failed to add label to chat:', error);
      return false;
    }
    
    console.log('Label added to chat successfully!');
    return true;
  } catch (error) {
    console.error('Error in addLabelToChat:', error);
    return false;
  }
};


export const createLabel = async (labelName: string, color: string): Promise<Label | null> => {
  try {
    if (!labelName || !color) {
      console.error('Invalid parameters for createLabel');
      return null;
    }
    
    const { data, error } = await supabase
      .from('labels')
      .insert({
        label_name: labelName,
        color: color,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create label:', error);
      return null;
    }
    
    console.log('Label created successfully!');
    return data as Label;
  } catch (error) {
    console.error('Error in createLabel:', error);
    return null;
  }
};

export const assignChatToUser = async (
  chatId: string, 
  assignedToUserId: string
): Promise<boolean> => {
  try {
    const session = await getSession();
    if (!session) {
      console.error('Not authenticated');
      return false;
    }
    
    const assignedByUserId = session.user.id;
    
    if (!chatId || !assignedToUserId) {
      console.error('Invalid parameters for assignChatToUser');
      return false;
    }
    
    const { error } = await supabase
      .from('assignments')
      .insert({
        chat_id: chatId,
        assigned_to: assignedToUserId,
        assigned_by: assignedByUserId,
      });

    if (error) {
      console.error('Failed to assign chat to user:', error);
      return false;
    }
    
    console.log('Chat assigned to user successfully!');
    return true;
  } catch (error) {
    console.error('Error in assignChatToUser:', error);
    return false;
  }
};



export const getUserChats = async (): Promise<Chat[]> => {
  try {
    const session = await getSession();
    if (!session) {
      console.error('Not authenticated');
      return [];
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('chat_members')
      .select(`
        chat_id,
        chats:chat_id(*)
      `)
      .eq('user_id', userId);

      if(data?.length == 0){
        return [];
      }

      if (error) {
      console.error('Failed to get user chats:', error);
        return [];
      }
     console.log("data", data);
   
  
    const uniqueChats = Object.values(
      data.reduce((acc, item) => {
        const chat = item.chats;
        //@ts-ignore
        if (chat && !acc[chat.id]) {
          //@ts-ignore
          acc[chat.id] = chat;
        }
        return acc;
      }, {} as Record<string, Chat>)
    );

    return uniqueChats;
  } catch (error) {
    console.error('Error in getUserChats:', error);
    return [];
  }
};


export const getChatMessages = async (chatId: string, limit: number = 20): Promise<Message[]> => {
  try {
    if (!chatId) {
      console.error('No chat ID provided');
      return [];
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select(`*, sender:sender_id(name, avatar_url)`)
      .eq('chat_id', chatId)
      .order('sent_at', { ascending: false }) // Get newest messages first
      .limit(limit);

    if (error) {
      console.error('Failed to get chat messages:', error);
      return [];
    }
    
    // Return messages in chronological order (oldest first)
    return (data as Message[]).reverse().map((message) => ({
      ...message,
      sender: message.sender,
    }))
    ;
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    return [];
  }
};



export const createGroupChat = async (chatName: string, userIds: string[]): Promise<Chat | null> => {
    try {
      const session = await getSession();
      if (!session) {
        console.error('Not authenticated');
        return null;
      }
      
      const userId = session.user.id;
      console.log(userId, "userId is this");

      if (!chatName) {
        console.error('No chat name provided');
        return null;
      }
      
      if (!userIds || userIds.length === 0) {
        console.error('No users to create chat with');
        return null;
      }
      console.log("userIds", userIds);
      
      // Add current user to the chat if not already included
      if (!userIds.includes(userId)) {
        userIds.push(userId);
      }
      

      const isGroup = userIds.length > 1;
      
      // Create the chat
      const { data, error } = await supabase
        .from('chats')
        .insert({
          chat_name: chatName,
          is_group: isGroup,
          created_by: userId,
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Failed to create chat:', error);
        return null;
      }
      
      console.log('Chat created successfully!', data);
      
      // Add members to the chat
      const chatMembers = userIds.map((memberId) => ({
        chat_id: data.id,
        user_id: memberId,
        is_admin: memberId === userId, // Make the creator an admin
      }));
      
      const { error: chatMembersError } = await supabase
        .from('chat_members')
        .insert(chatMembers);
      
      if (chatMembersError) {
        console.error('Failed to add members to chat:', chatMembersError);
        // Consider rolling back the chat creation here
        return null;
      }
      
      console.log('Chat members added successfully!');
      
      // Return the created chat
      return data;
    } catch (error) {
      console.error('Error in createChat:', error);
      return null;
    }
  };


 
  export const createOneOnOneChat = async (userId: string): Promise<Chat | null> => {
    try {
      const session = await getSession();
      if (!session) {
        console.error('Not authenticated');
        return null;
      }
  
      const currentUserId = session.user.id;
  
      // Check if the other user exists
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
     
        console.log("targetUser", targetUser);
        console.log("userError", userError);
        
      if (userError || !targetUser) {
        console.error('User not found:', userError);
        return null;
      }
   
  
      const otherUserName = targetUser.name || 'Unknown';
  
      // Call RPC to check for existing one-on-one chat
      const { data: existingChatId, error: rpcError } = await supabase.rpc(
        'find_one_on_one_chat',
        {
          user_a: currentUserId,
          user_b: userId,
        }
      );
  
      if (rpcError) {
        console.error('RPC error:', rpcError);
        return null;
      }
  

      console.log("existingChatId", existingChatId);
      console.log("currentUserId", currentUserId);
      console.log("userId", userId);
      
      if (existingChatId) {
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', existingChatId)
          .single();
  
        if (chatError) {
          console.error('Failed to fetch chat:', chatError);
          return null;
        }
  
        return chat as Chat;
      }
       
      const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert({
          chat_name: otherUserName,
          is_group: false,
          created_by: currentUserId,
        })
        .select('*')
        .single();
  
      if (insertError || !newChat) {
        console.error('Failed to create chat:', insertError);
        return null;
      }
      console.log("newChat", newChat);
      console.log("newChat.id", newChat.id);
  
      const chatMembers = [
        { chat_id: newChat.id, user_id: currentUserId, is_admin: true },
        { chat_id: newChat.id, user_id: userId, is_admin: false },
      ];
  
      const { error: memberError } = await supabase
        .from('chat_members')
        .insert(chatMembers);
  
      if (memberError) {
        console.error('Failed to insert chat members:', memberError);
        return null;
      }
  
      return newChat as Chat;
    } catch (error) {
      console.error('Error in createOneOnOneChat:', error);
      return null;
    }
  };
  


export const sendChatMessage = async (chatId: string, content: string): Promise<Message | null> => {
  try {
    const session = await getSession();
    if (!session) {
      console.error('Not authenticated');
      return null;
    }
    
    const senderId = session.user.id;
    
    if (!chatId || !content) {
      console.error('Invalid parameters for sendChatMessage');
      return null;
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content: content,
        type: 'text',
        sent_at: new Date().toISOString(),
      })
      .select('*, sender:sender_id(name, avatar_url)')
      .single();
    
    if (error) {
      console.error('Failed to send chat message:', error);
      return null;
    }
    
    // We'll handle socket emission in the component
    console.log('Chat message sent successfully!');
    return data as Message;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    return null;
  }
};


export const getAllUserForSpecificChat = async (chatId: string): Promise<UserProfile[]> => {
  try {
    if (!chatId) {
      console.error('No chat ID provided');
      return [];
    }
    
    const { data, error } = await supabase
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId);
    
    if (error) {
      console.error('Failed to get chat members:', error);
      return [];
    }
    
    const userIds = data.map((member) => member.user_id);
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (usersError) {
      console.error('Failed to get user profiles:', usersError);
      return [];
    }
    
    return users as UserProfile[];
  } catch (error) {
    console.error('Error in getAllUserForSpecificChat:', error);
    return [];
  }
};
