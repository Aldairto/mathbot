"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, ChevronDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChatMessage } from "@/components/chat-message"
import { RelevantTopics } from "@/components/relevant-topics"

type Message = {
  role: "user" | "assistant" | "error"
  content: string
}

type Topic = {
  mainTopic: string
  subTopic: string
  importance: number
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  // Detectar cuando el usuario ha hecho scroll hacia arriba
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isNearBottom)
      }
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchMessages()
    }
  }, [session])

  useEffect(() => {
    scrollToBottom()

    // Añadir el evento de scroll
    const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [scrollToBottom, handleScroll])

  // Efecto para desplazarse al fondo cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom]) // Removed 'messages' dependency

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      if (!response.ok) {
        throw new Error(`Error al cargar los mensajes: ${response.status}`)
      }
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error al obtener mensajes:", error)
      setError("Error al cargar los mensajes")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !session?.user?.id || isLoading) return

    setIsLoading(true)
    setError(null)
    const currentInput = input
    setInput("") // Clear input immediately for better UX

    try {
      // Añadir mensaje del usuario inmediatamente para mejor UX
      setMessages((prevMessages) => [...prevMessages, { role: "user", content: currentInput }])

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: currentInput }],
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error desconocido")
      }

      const assistantContent = data.content
      console.log("Contenido recibido del asistente:", assistantContent)

      setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: assistantContent }])
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error desconocido")
      // Eliminar el mensaje del usuario si hay un error
      setMessages((prevMessages) => prevMessages.slice(0, -1))
      setInput(currentInput) // Restore input on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (session?.user?.id) {
      try {
        await fetch("/api/messages", { method: "DELETE" })
        setMessages([])
      } catch (error) {
        console.error("Error clearing messages:", error)
        setError("Error al limpiar los mensajes")
      }
    }
  }

  const handleTopicSelect = async (topic: Topic) => {
    const prompt = `Por favor, explícame el tema "${topic.mainTopic}" enfocándote en el subtema "${topic.subTopic}". Proporciona una explicación clara y concisa, incluyendo definiciones clave, ejemplos y, si es aplicable, fórmulas relevantes.`
    setInput(prompt)
  }

  const scrollToBottomManually = () => {
    scrollToBottom()
    setShowScrollButton(false)
  }

  return (
    <div className="flex flex-col w-full h-full border rounded-lg overflow-hidden bg-background shadow-lg">
      <div className="flex-shrink-0">
        <RelevantTopics onTopicSelect={handleTopicSelect} />
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {Array.isArray(messages) &&
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`mb-4 ${message.role === "user" ? "flex justify-end" : ""}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {message.role === "user" ? (
                  <Avatar className="w-6 h-6 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">TÚ</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-6 h-6 mt-1">
                    <AvatarImage src="/mathbot-avatar.png" alt="MathBot" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">MB</AvatarFallback>
                  </Avatar>
                )}
                <ChatMessage content={message.content} role={message.role as "assistant" | "user"} />
              </div>
            </div>
          ))}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </ScrollArea>
      {showScrollButton && (
        <div className="relative">
          <Button
            onClick={scrollToBottomManually}
            className="absolute bottom-16 right-4 rounded-full p-2 z-10 shadow-md"
            size="icon"
            variant="secondary"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="p-3 bg-background border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta matemática..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
        <Button onClick={handleClearChat} variant="outline" className="w-full text-sm h-8">
          Limpiar chat
        </Button>
      </div>
    </div>
  )
}

