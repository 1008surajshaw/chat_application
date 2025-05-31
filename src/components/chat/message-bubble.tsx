import Image from "next/image"

interface Message {
  id: string
  senderId: string
  content: string
  time: string
  date: string
  label?: string
  senderName: string
  senderAvatar?: string
  phoneNumber?: string
  email?: string
  isRead?: boolean
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      {!isOwn && (
        <div className="mr-2 mt-1">
          {message.senderAvatar ? (
            <Image
              src={message.senderAvatar || "/placeholder.svg"}
              alt={message.senderName}
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {message.senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div
        className={`relative max-w-[80%] md:max-w-[70%] rounded-lg p-2 ${
          isOwn
            ? "bg-[#dcf8c6] dark:bg-green-700 text-black dark:text-white rounded-tr-none "
            : "bg-white border-1 dark:bg-gray-800 text-black dark:text-white rounded-tl-none pr-20"
        }`}
      >
        {/* Sender info */}
        {!isOwn && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-green-500">{message.senderName}</span>
            {message.phoneNumber && <span className="text-xs text-gray-500">{message.phoneNumber}</span>}
          </div>
        )}

        {isOwn && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-green-500">Periskope</span>
            <span className="text-xs text-gray-500">{message.phoneNumber || "+91 99718 44008"}</span>
          </div>
        )}

        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Footer with time and read status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          {isOwn && message.email && (
            <div className="flex items-center mr-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M22 7.99a8 8 0 0 0-12.5-6.5" />
                <path d="M20 11a8 8 0 0 1-14 3" />
                <path d="M2 16v-3a4 4 0 0 1 4-4h3" />
                <path d="M22 16v-3a4 4 0 0 0-4-4h-3" />
              </svg>
              <span className="text-[10px] text-gray-400 ml-1">{message.email || "bharat@hashlabs.dev"}</span>
            </div>
          )}

          <span className="text-[10px] text-gray-500 pr-20">{message.time}</span>

          {isOwn && (
            <div className="flex">
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
                className="text-blue-500 -ml-2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
