"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Eraser, Copy, Check } from 'lucide-react'
import { useSession } from "next-auth/react"
import "katex/dist/katex.min.css"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showExamples, setShowExamples] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const examples = [
    "¿Puedes explicarme cómo resolver ecuaciones cuadráticas?",
    "¿Qué es una función trigonométrica?",
    "Necesito ayuda con un problema de probabilidad",
    "¿Cómo se calcula el área de un triángulo?"
  ]

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      console.log("[Chat] Cargando mensajes anteriores")
      const response = await fetch("/api/messages")
      if (!response.ok) {
        throw new Error(`Error al cargar mensajes: ${response.status}`)
      }
      const data = await response.json()
      console.log(`[Chat] Cargados ${data.length} mensajes`)
      
      if (data.length > 0) {
        setMessages(data)
        setShowExamples(false)
      } else {
        // Si no hay mensajes, mostramos un mensaje de bienvenida
        setMessages([{
          role: "assistant",
          content: "👋 ¡Hola! Soy MathBot, tu asistente matemático. Puedo ayudarte con problemas, conceptos y ejercicios de matemáticas. ¿En qué puedo ayudarte hoy?",
          timestamp: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error("[Chat] Error al cargar mensajes:", error)
      setError("No se pudieron cargar los mensajes anteriores.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Limpiar error anterior
    setError(null)
    setShowExamples(false)

    // Agregar mensaje del usuario a la UI
    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("[Chat] Enviando mensaje a /api/chat")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Chat] Error en respuesta:", response.status, errorData)
        throw new Error(errorData.error || `Error en la respuesta del servidor: ${response.status}`)
      }

      const data = await response.json()
      console.log("[Chat] Respuesta recibida correctamente")

      // Agregar respuesta del asistente a la UI
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.content,
        timestamp: new Date().toISOString()
      }])
    } catch (error: any) {
      console.error("[Chat] Error al enviar mensaje:", error)
      setError(error.message || "Ocurrió un error desconocido")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message || "Ocurrió un error desconocido"}`,
          timestamp: new Date().toISOString()
        },
      ])
    } finally {
      setIsLoading(false)
      // Enfocar el input después de recibir respuesta
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleClearChat = async () => {
    try {
      const response = await fetch("/api/messages", {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Error al limpiar el historial")
      }
      
      // Reiniciar el chat con mensaje de bienvenida
      setMessages([{
        role: "assistant",
        content: "👋 ¡Hola! Soy MathBot, tu asistente matemático. Puedo ayudarte con problemas, conceptos y ejercicios de matemáticas. ¿En qué puedo ayudarte hoy?",
        timestamp: new Date().toISOString()
      }])
      setShowExamples(true)
      setError(null)
    } catch (error: any) {
      setError(error.message || "Error al limpiar el historial")
    }
  }

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
    inputRef.current?.focus()
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {messages.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-500 dark:text-gray-400 my-8">
            No hay mensajes. ¡Comienza una conversación!
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col max-w-[80%]">
              <div className="flex items-center mb-1">
                {message.role !== "user" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">MathBot</div>
                )}
                <div className="text-xs text-gray-400">
                  {formatTimestamp(message.timestamp)}
                </div>
                {message.role === "user" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">Tú</div>
                )}
              </div>
              <div className="flex items-start">
                <div
                  className={`relative rounded-lg p-3 ${
                    message.role === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {message.role === "assistant" && (
                    <button 
                      onClick={() => handleCopyMessage(message.content, index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-gray-300/50 dark:bg-gray-600/50 hover:bg-gray-300 dark:hover:bg-gray-600"
                      aria-label="Copiar mensaje"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-200 dark:bg-gray-700 dark:text-white">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        {showExamples && !isLoading && messages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Prueba preguntar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearChat}
            className="text-gray-500 hover:text-red-500"
          >
            <Eraser className="h-4 w-4 mr-1" />
            Limpiar chat
          </Button>
          
          {session?.user ? (
            <div className="text-xs text-gray-500">
              Conectado como {session.user.name || session.user.email}
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Modo invitado
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Enviar
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}