import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  senderId: string
  content: string
  time: string
  date: string
  label?: string
  senderName: string
  senderAvatar: string
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  
  //assigning profile avatar to specific senderId

  const senderAvatar = message.senderId === "user" ? "/user-avatar.png" : "/bot-avatar.png"
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`relative max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
          isOwn 
            ? "bg-green-100 dark:bg-green-900 text-black dark:text-white rounded-tr-none" 
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none"
        }`}
      >
        <div className="flex items-start gap-2">

          <div className="flex-1"> 
            <div className=" flex flex-col">
            <div className="flex items-center gap-2">
              <div>
                
                {message.senderAvatar ? (
                  <img src={message.senderAvatar} alt={message.senderName} className="h-6 w-6 rounded-full" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                    {message.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div> 
               <div>{message.senderName}</div>
            </div>

            <p className="text-sm">{message.content}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[10px] text-muted-foreground">{message.time}</span>
              {isOwn && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            </div>
          </div>

          {message.label && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-4 font-normal self-start ml-1 ${
                isOwn 
                  ? "border-green-500 text-green-500" 
                  : "border-blue-500 text-blue-500"
              }`}
            >
              {message.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}