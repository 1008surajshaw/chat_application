import ChatInterface from "@/components/chat/chat-interface"

// Use dynamic rendering to ensure we get fresh data
export const dynamic = 'force-dynamic'
// Disable static generation to ensure we get fresh data
export const revalidate = 0

export default function ChatDetailPage() {
  return <ChatInterface />
}
