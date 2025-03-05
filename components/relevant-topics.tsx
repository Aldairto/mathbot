"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ChevronDown, ChevronUp, BookOpen } from "lucide-react"

type Topic = {
  mainTopic: string
  subTopic: string
  importance: number
}

export function RelevantTopics({ onTopicSelect }: { onTopicSelect: (topic: Topic) => void }) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false) // Por defecto colapsado

  useEffect(() => {
    fetchRelevantTopics()
  }, [])

  const fetchRelevantTopics = async () => {
    try {
      const response = await fetch("/api/relevant-topics")
      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics)
      } else {
        console.error("Error al obtener los temas relevantes")
      }
    } catch (error) {
      console.error("Error al obtener los temas relevantes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-2 border shadow-sm">
      <CardHeader
        className="py-2 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Temas Relevantes para Estudiar
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-4 py-2">
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : topics.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
              {topics.map((topic) => (
                <Button
                  key={`${topic.mainTopic}-${topic.subTopic}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onTopicSelect(topic)}
                >
                  {topic.mainTopic}: {topic.subTopic}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-1">No hay temas relevantes para estudiar en este momento.</p>
          )}
        </CardContent>
      )}
    </Card>
  )
}

