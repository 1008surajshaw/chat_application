"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Phone } from "lucide-react"

interface Chat {
  id: string
  title: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unread: boolean
  unreadCount?: number
  labels: string[]
  isGroup?: boolean
  phoneNumber?: string
}

interface ChatListProps {
  chats: Chat[]
  selectedChat: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export default function ChatList({ chats, selectedChat, onChatSelect, onNewChat }: ChatListProps) {
  // Default labels if none provided
  const getDefaultLabels = () => {
    const defaultLabels = ["Demo", "Support"]
    return defaultLabels
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.length > 0 ? (
        chats.map((chat) => {
          const displayLabels = chat.labels.length > 0 ? chat.labels : getDefaultLabels()

          return (
            <div
              key={chat.id}
              className={`flex items-start p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 ${
                selectedChat === chat.id ? "bg-muted/70" : ""
              }`}
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.title} />
                  <AvatarFallback className="bg-muted">{chat.title.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {chat.isGroup && (
                  <div className="absolute -bottom-1 -left-1 bg-black text-white text-xs rounded px-1 py-0.5 font-bold">
                    {chat.unreadCount || 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 mr-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-medium truncate ${chat.unread ? "font-bold" : "font-normal"}`}>
                    {chat.title}
                  </h3>
                  
                </div>

                <p
                  className={`text-xs truncate mb-1 ${
                    chat.unread ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {chat.lastMessage}
                </p>

                {chat.phoneNumber && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{chat.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">

                <div className="flex gap-1 flex-wrap justify-end">
                  {displayLabels.map((label, index) => (
                    <div
                      key={index}
                      
                      className={`text-[10px] px-1.5 py-0 h-4 font-normal ${
                        label === "Demo"
                          ? " text-orange-600 bg-orange-50"
                          : label === "Internal"
                            ? " text-green-600 bg-green-50"
                            : label === "Content"
                              ? " text-green-600 bg-green-50"
                              : label === "Signup"
                                ? " text-green-600 bg-green-50"
                                : label === "Support"
                                  ? " text-blue-600 bg-blue-50"
                                  : label === "Group"
                                    ? " text-purple-600 bg-purple-50"
                                    : " text-gray-600 bg-gray-50"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {chat.unread && chat.unreadCount && chat.unreadCount > 1 && (
                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </Badge>
                )}

                <div className="flex items-center gap-2 ml-2 pt-2">
                  {chat.unread && <div className="h-2 w-2 bg-green-500 rounded-full"></div>}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.lastMessageTime}</span>
                </div>

              </div>
            </div>
          )
        })
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <p className="text-sm mb-2">No chats found</p>
          <Button variant="outline" size="sm" className="gap-1" onClick={onNewChat}>
            <Plus className="h-4 w-4" />
            Start new chat
          </Button>
        </div>
      )}
    </div>
  )
}
