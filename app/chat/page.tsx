"use client"

// Cambiar la importación para usar la exportación por defecto
import ChatInterface from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <div className="container mx-auto h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Chat con MathBot</h1>
      <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}


