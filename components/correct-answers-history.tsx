"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "katex/dist/katex.min.css"

// Importar KaTeX de forma dinámica para evitar errores de SSR
const InlineMath = dynamic(() => import("react-katex").then((mod) => mod.InlineMath), { ssr: false })
const BlockMath = dynamic(() => import("react-katex").then((mod) => mod.BlockMath), { ssr: false })

type CorrectAnswer = {
  id: string
  question: string
  answer: string
  mainTopic: string
  subTopic: string
  createdAt: string
}

export function CorrectAnswersHistory() {
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([])
  const [filteredAnswers, setFilteredAnswers] = useState<CorrectAnswer[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCorrectAnswers()
  }, [])

  useEffect(() => {
    if (selectedTopic === "all") {
      setFilteredAnswers(correctAnswers)
    } else {
      setFilteredAnswers(correctAnswers.filter((answer) => answer.mainTopic === selectedTopic))
    }
  }, [selectedTopic, correctAnswers])

  const fetchCorrectAnswers = async () => {
    try {
      const response = await fetch("/api/correct-answers")
      if (response.ok) {
        const data = await response.json()
        setCorrectAnswers(data.correctAnswers)
        const uniqueTopics = Array.from(new Set(data.correctAnswers.map((answer: CorrectAnswer) => answer.mainTopic)))
        setTopics(uniqueTopics)
      } else {
        console.error("Error al obtener las respuestas correctas")
      }
    } catch (error) {
      console.error("Error al obtener las respuestas correctas:", error)
    }
  }

  const renderMathExpression = (text: string) => {
    // Verificar si el componente InlineMath y BlockMath están cargados
    if (typeof InlineMath === "undefined" || typeof BlockMath === "undefined") {
      return <span>{text}</span>
    }

    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/gs)
    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <BlockMath key={index} math={part.slice(2, -2)} />
      } else if (part.startsWith("$") && part.endsWith("$")) {
        return <InlineMath key={index} math={part.slice(1, -1)} />
      } else {
        return <span key={index}>{part}</span>
      }
    })
  }

  const getPdfFilename = () => {
    return selectedTopic === "all"
      ? "historial_respuestas_correctas.pdf"
      : `historial_respuestas_correctas_${selectedTopic.replace(/\s+/g, "_")}.pdf`
  }

  const getPdfTitle = () => {
    return selectedTopic === "all"
      ? "Historial de Respuestas Correctas"
      : `Historial de Respuestas Correctas - ${selectedTopic}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Respuestas Correctas</CardTitle>
        <div className="flex items-center space-x-2">
          <Select onValueChange={setSelectedTopic} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los temas</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAnswers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay respuestas correctas para mostrar</div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div id="correct-answers-content" ref={contentRef}>
              {filteredAnswers.map((answer) => (
                <div key={answer.id} className="mb-4 p-2 border-b">
                  <p className="font-semibold">{renderMathExpression(answer.question)}</p>
                  <p>Respuesta: {renderMathExpression(answer.answer)}</p>
                  <p className="text-sm text-muted-foreground">
                    {answer.mainTopic} - {answer.subTopic}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(answer.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

