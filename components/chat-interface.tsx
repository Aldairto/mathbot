'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useChat } from 'ai/react'
import { Send } from 'lucide-react'

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-gray-50">
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
            <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'user' ? (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">TÚ</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/mathbot-avatar.png" alt="MathBot" />
                  <AvatarFallback className="bg-primary text-primary-foreground">MB</AvatarFallback>
                </Avatar>
              )}
              <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-white border'}`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu pregunta matemática..."
            className="flex-grow"
          />
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </div>
      </form>
    </div>
  )
}

