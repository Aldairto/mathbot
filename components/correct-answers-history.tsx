"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InlineMath, BlockMath } from "react-katex"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from 'lucide-react'
import "katex/dist/katex.min.css"

type CorrectAnswer = {
  id: string
  question: string
  answer: string
  explanation?: string // Añadir campo opcional para la explicación
  mainTopic: string
  subTopic: string
  createdAt: string
}

export function CorrectAnswersHistory() {
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([])
  const [filteredAnswers, setFilteredAnswers] = useState<CorrectAnswer[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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
    if (!text) return null
    
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g)
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

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedTopic }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "historial_respuestas_correctas.pdf"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error("Error al generar el PDF")
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
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
          <Button onClick={generatePDF} variant="outline" size="icon" disabled={isGeneratingPDF}>
            {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {filteredAnswers.map((answer) => (
            <div key={answer.id} className="mb-4 p-2 border-b">
              <p className="font-semibold">{renderMathExpression(answer.question)}</p>
              <p>Respuesta: {renderMathExpression(answer.answer)}</p>
              
              {/* Mostrar la explicación si existe */}
              {answer.explanation && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Explicación:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-200">{renderMathExpression(answer.explanation)}</p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mt-2">
                {answer.mainTopic} - {answer.subTopic}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(answer.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

