import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"

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
}

interface ChatListProps {
  chats: Chat[]
  selectedChat: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export default function ChatList({ chats, selectedChat, onChatSelect, onNewChat }: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-start p-3 hover:bg-muted/50 cursor-pointer ${selectedChat === chat.id ? "bg-muted/70" : ""}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
              <Image 
                src={chat.avatar || "/placeholder.svg?height=48&width=48"} 
                alt={chat.title} 
                width={48} 
                height={48}
              />
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className={`text-sm truncate ${chat.unread ? "font-bold" : "font-normal"}`}>{chat.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.lastMessageTime}</span>
              </div>

              <div className="flex items-center mt-1">
                <p
                  className={`text-xs truncate ${chat.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {chat.lastMessage}
                </p>
              </div>

              <div className="flex gap-1 mt-1">
                {chat.labels.map((label, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 font-normal ${
                      label === "Demo"
                        ? "border-green-500 text-green-500"
                        : label === "Internal"
                          ? "border-blue-500 text-blue-500"
                          : label === "Content"
                            ? "border-purple-500 text-purple-500"
                            : label === "Signup"
                              ? "border-orange-500 text-orange-500"
                              : label === "Group"
                                ? "border-indigo-500 text-indigo-500"
                                : ""
                    }`}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {chat.unread && chat.unreadCount && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500">
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        ))
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