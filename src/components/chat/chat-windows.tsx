"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { ArrowLeft, MoreVertical, Search, Phone, VideoIcon, ChevronDown, Info, X, Sparkle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import MessageBubble from "@/components/chat/message-bubble"
import { getAllUserForSpecificChat, getChatMessages, sendChatMessage } from "@/actions/chat"
import { Chat } from "@/interface/interface"
import { useAuth } from "@/providers/auth-provider"
import { useSocket } from '@/hooks/use-socket';
import { createClient } from '@supabase/supabase-js';
import { debounce } from 'lodash';
import Image from "next/image"
import { ChatMessagesSkeleton } from "../ui/skeletons/chat-messages-skeleton"
import { AnimatedTooltip } from "../ui/animated-tooltip"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! as string;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ChatWindowProps {
  chatId: string | null
  onBackClick: () => void
  onProfileClick: () => void
  isChatLoading: boolean
  userChats: Chat[]
}

export default function ChatWindow({ 
  chatId, 
  onBackClick, 
  onProfileClick,
  isChatLoading,
  userChats
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [chatMembers, setChatMembers] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const { user } = useAuth()



  useEffect(() => {
    const fetchChatMembers = async () => {
      if (!chatId) return;
      
      try {
        const members = await getAllUserForSpecificChat(chatId);
        if (Array.isArray(members)) {
          // Format members for AnimatedTooltip
          const formattedMembers = members.map((member, index) => ({
            id: index,
            name: member.name || 'Unknown User',
            image: member.avatar_url || '/placeholder.svg?height=40&width=40'
          }));
          setChatMembers(formattedMembers);
        }
      } catch (error) {
        console.error("Error fetching chat members:", error);
      }
    };
    
    fetchChatMembers();
  }, [chatId]);


  
  // Use the enhanced socket hook
  const { socket, isConnected, sendSocketMessage, handleTyping, typingUsers, onlineUsers } = useSocket(chatId);
  
  const selectedChat = useMemo(() => {
    return userChats.find(chat => chat.id === chatId) || null
  }, [chatId, userChats]);
  
  // Get the other user's ID in a one-on-one chat
  const otherUserId = useMemo(() => {
    if (!selectedChat || selectedChat.isGroup || !user?.id) return null;
    
 
    //@ts-ignore
    const { data: members } = supabase
      .from("chat_members")
      .select("user_id")
      .eq("chat_id", selectedChat.id)
      .then(result => result);
      
    if (!members) return null;
    //@ts-ignore
    return members.find(m => m.user_id !== user.id)?.user_id || null;
  }, [selectedChat, user?.id]);
  
  // Check if the other user is typing
  const isOtherUserTyping = useMemo(() => {
    if (!otherUserId) return false;
    return typingUsers.includes(otherUserId);
  }, [typingUsers, otherUserId]);
  
  // Get the other user's online status
  const otherUserStatus = useMemo(() => {
    if (!otherUserId) return 'offline';
    return onlineUsers[otherUserId] || 'offline';
  }, [onlineUsers, otherUserId]);
  
  // Create a debounced function for handling typing
  const debouncedHandleTyping = useCallback(
    debounce((value: string) => {
      handleTyping(value);
    }, 300),
    [handleTyping]
  );
  
  // Update the input change handler to trigger typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    debouncedHandleTyping(value);
  };
  
  // Group messages by date - memoized to prevent recalculation on every render
  const messagesByDate = useMemo(() => {
    const groupedMessages: Record<string, any[]> = {}
    
    // Ensure chatMessages is an array before using forEach
    if (Array.isArray(chatMessages)) {
      chatMessages.forEach((message) => {
        if (message && message.sent_at) {
          const date = new Date(message.sent_at).toLocaleDateString()
          if (!groupedMessages[date]) {
            groupedMessages[date] = []
          }
          groupedMessages[date].push(message)
        }
      })
    }
    
    return groupedMessages
  }, [chatMessages])

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (data: any) => {
      console.log('Received new message via socket:', data);
      
      if (data.chatId === chatId) {
        // Add the new message to the chat
        setChatMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg.id === data.message.id);
          
          if (messageExists) return prevMessages;
          
          return [...prevMessages, data.message];
        });
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    
    socket.on('new-message', handleNewMessage);
    
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, chatId]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      // Create a temporary message object with a temporary ID
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        chat_id: chatId,
        sender_id: user?.id,
        content: newMessage,
        type: 'text',
        sent_at: new Date().toISOString(),
        sender: {
          //@ts-ignore
          name: user?.name || 'You',
          //@ts-ignore
          avatar_url: user?.avatar_url
        }
      };
      
      // Add the message to the UI immediately for better UX
      setChatMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Clear the input
      setNewMessage("");
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Send message to server
      const message = await sendChatMessage(chatId, newMessage);
      
      if (message) {
        // Emit the message via socket for real-time updates
        const socketSent = sendSocketMessage({
          id: message.id,
          chat_id: chatId,
          sender_id: user?.id,
          content: newMessage,
          type: 'text',
          sent_at: new Date().toISOString(),
          sender: {
            //@ts-ignore
            name: user?.name || 'You',
            //@ts-ignore
            avatar_url: user?.avatar_url
          }
        });
        
        if (!socketSent) {
          console.warn('Socket message not sent, but database message was saved');
        }
        
        // Replace the temporary message with the real one
        setChatMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempId ? message : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove the temporary message if there was an error
      setChatMessages(prevMessages => 
        prevMessages.filter(msg => !msg.id.startsWith('temp-'))
      );
    }
  }, [newMessage, chatId, user, sendSocketMessage]);


  // Fetch messages when chatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return
      
      setIsMessagesLoading(true)
      try {
        const messages = await getChatMessages(chatId)
        setChatMessages(Array.isArray(messages) ? messages : [])
      } catch (error) {
        console.error("Error fetching messages:", error)
        setChatMessages([]) 
      } finally {
        setIsMessagesLoading(false)
      }
    }
    
    fetchMessages()
  }, [chatId])

  // Add this useEffect for Supabase Realtime subscription
  useEffect(() => {
    if (!chatId) return;
    
    // Subscribe to new messages in this chat
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          // When a new message is inserted, fetch the sender info
          const newMessage = payload.new as any;
          
          // Only add the message if it's not from the current user
          // (to avoid duplicates since we already add our own messages)
          if (newMessage.sender_id !== user?.id) {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();
              
            setChatMessages(prevMessages => {
              // Check if message already exists to prevent duplicates
              const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
              
              if (messageExists) return prevMessages;
              
              return [
                ...prevMessages,
                {
                  ...newMessage,
                  sender: senderData
                }
              ];
            });
            
            // Scroll to bottom
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      )
      .subscribe();
    
    // Unsubscribe when component unmounts or chatId changes
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, user?.id]);



  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  if (isChatLoading || isMessagesLoading) {
    return <ChatMessagesSkeleton/>
  }

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chat App</h2>
          <p className="text-muted-foreground">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-2 border-b bg-sidebar">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-1" onClick={onBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center flex-1 cursor-pointer" onClick={onProfileClick}>
          <Avatar className="h-10 w-10 mr-3">
            <Image src={selectedChat.avatar || "/placeholder.svg?height=40&width=40"} alt={selectedChat.title} width={40} height={40} />
          </Avatar>

          <div>
            <h3 className="font-semibold text-sm">{selectedChat.title}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedChat.isGroup ? "Group · " : ""}
              {isOtherUserTyping ? (
                <span className="text-primary animate-pulse">typing...</span>
              ) : (
                otherUserStatus || "offline"
              )}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-4">

        <div className="flex items-center gap-1">
          <AnimatedTooltip items={chatMembers} />
        </div>
          <Button variant="ghost" size="icon" className="rounded-full">
          <Sparkle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
        </div>
          
         
        
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            <div className="flex justify-center">
                <div className="text-gray-500 bg-gray-50 bg-opacity-20 px-2 py-1 rounded-md font-semibold dark:text-white dark:bg-gray-800 text-xs ">
                {date}
                </div>
            </div>

            {dateMessages.map((message) => {
              // Check if the current user is the sender
              const isCurrentUserSender = user?.id === message.sender_id;
              
              return (
                <MessageBubble 
                  key={message.id} 
                  message={{
                    id: message.id,
                    senderId: message.sender_id,
                    senderName: message.sender.name,
                    senderAvatar: message.sender.avatar_url,
                    content: message.content,
                    time: new Date(message.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    date: new Date(message.sent_at).toLocaleDateString(),
                    label: message.type !== "text" ? message.type : undefined
                  }} 
                  isOwn={isCurrentUserSender} 
                />
              );
            })}
          </div>
        ))}
        {(!chatMessages || chatMessages.length === 0) && (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 bg-white ">
        {/* Top tabs section */}
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-white rounded-t-md text-green-700 text-sm font-medium border border-b-0">
              <span>WhatsApp</span>
              <Info size={10}/>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-50 rounded-t-md text-yellow-700 text-sm border border-b-0">
              <span>Private Note</span>
              <Info size={10}/> 
            </div>
          </div>
          
        </div>

        {/* Main input area */}
        <div className="flex items-center gap-3 mb-3 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center flex-1 bg-gray-50 rounded-full px-4 py-2">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
            />
          </form>
          
          <Button type="submit" onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 rounded-full p-2 h-10 w-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </Button>
            
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" x2="9.01" y1="9" y2="9" />
                <line x1="15" x2="15.01" y1="9" y2="9" />
              </svg>
            </Button>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </Button>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </Button>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </Button>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="9" x2="15" y1="9" y2="9" />
                <line x1="9" x2="15" y1="15" y2="15" />
              </svg>
            </Button>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </Button>
          </div>

          {/* Periskope section on the right */}
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium">
              P
            </div>
            <span className="text-sm ml-2 text-gray-700 font-medium">Periskope</span>
            <button className="ml-1">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}





