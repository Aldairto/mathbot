"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Topic = {
  mainTopic: string
  subTopic: string
  difficulty: number
  importance: number
}

export function CustomCurriculum() {
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    fetchAdaptiveCurriculum()
  }, [])

  const fetchAdaptiveCurriculum = async () => {
    try {
      const response = await fetch("/api/adaptive-curriculum")
      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics)
      } else {
        console.error("Error al obtener el currículo adaptativo")
      }
    } catch (error) {
      console.error("Error al obtener el currículo adaptativo:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temario Personalizado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={`${topic.mainTopic}-${topic.subTopic}`} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">
                  {topic.mainTopic}: {topic.subTopic}
                </span>
                <span className="text-sm text-muted-foreground">
                  Dificultad: {(topic.difficulty * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={topic.importance * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">Importancia: {(topic.importance * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

