import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Chat con MathBot</h1>
      <div className="max-w-3xl mx-auto h-full">
        <ChatInterface />
      </div>
    </div>
  )
}

