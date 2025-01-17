import { Metadata } from 'next'
import { ChatInterface } from '@/components/chat-interface'

export const metadata: Metadata = {
  title: 'Chat con MathBot',
  description: 'Haz preguntas y resuelve ejercicios de matemáticas con MathBot',
}

export default function ChatPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Chat con MathBot</h1>
      <ChatInterface />
    </div>
  )
}

