"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

// Asegurarnos de que el componente se exporte como default
export default function ChatInterface() {
  // El resto del componente se mantiene igual
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Cargar mensajes al inicio
    fetchMessages()
  }, [])

  useEffect(() => {
    // Scroll al último mensaje
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      console.log("[Chat] Cargando mensajes anteriores")
      const response = await fetch("/api/messages")
      if (!response.ok) {
        throw new Error(`Error al cargar mensajes: ${response.status}`)
      }
      const data = await response.json()
      console.log(`[Chat] Cargados ${data.length} mensajes`)
      setMessages(data)
    } catch (error) {
      console.error("[Chat] Error al cargar mensajes:", error)
      setError("No se pudieron cargar los mensajes anteriores.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Limpiar error anterior
    setError(null)

    // Agregar mensaje del usuario a la UI
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Intentamos con la ruta App Router
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }])
    } catch (error) {
      console.error("[Chat] Error al enviar mensaje:", error)
      setError(error.message || "Ocurrió un error desconocido")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message || "Ocurrió un error desconocido"}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex flex-col h-full">
      {/* ... resto del JSX ... */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {messages.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-500 dark:text-gray-400 my-8">
            No hay mensajes. ¡Comienza una conversación!
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-200 dark:bg-gray-700 dark:text-white">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}

