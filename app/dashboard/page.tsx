"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserProgress } from "@/components/user-progress"
import { LearningStats } from "@/components/learning-stats"
import { CorrectAnswersHistory } from "@/components/correct-answers-history"
import StudyTimeDisplay from "@/components/study-time-display"
import { Skeleton } from "@/components/ui/skeleton"

type QuizResult = {
  mainTopic: string
  subTopic: string
  correctCount: number
  incorrectCount: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session?.user && "id" in session.user) {
      fetchQuizResults()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchQuizResults = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quiz-results")
      if (response.ok) {
        const data = await response.json()
        // Modificación: Extraer el array de resultados correctamente
        setQuizResults(data.results || data || [])
      } else {
        console.error("Error al obtener los resultados de los cuestionarios")
        setQuizResults([]) // Establecer un array vacío en caso de error
      }
    } catch (error) {
      console.error("Error al obtener los resultados de los cuestionarios:", error)
      setQuizResults([]) // Establecer un array vacío en caso de error
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalProgress = () => {
    // Modificación: Verificar que quizResults sea un array válido
    if (!quizResults || !Array.isArray(quizResults) || quizResults.length === 0) {
      return 0
    }

    const totalQuestions = quizResults.reduce((sum, result) => sum + result.correctCount + result.incorrectCount, 0)
    const correctQuestions = quizResults.reduce((sum, result) => sum + result.correctCount, 0)
    return totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-40 w-full mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full col-span-2" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <div className="text-center text-lg py-8">Por favor, inicia sesión para ver tu dashboard.</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Mi Avance</h1>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Bienvenido, {session?.user?.name || "Estudiante"}</CardTitle>
              <CardDescription>Aquí tienes un resumen de tu progreso</CardDescription>
            </div>
            <StudyTimeDisplay />
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Progreso General</CardTitle>
            <CardDescription>Tu avance en el aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={calculateTotalProgress()} className="w-full h-4 mb-2" />
            <p className="text-sm text-muted-foreground">
              Has completado el {calculateTotalProgress().toFixed(2)}% del curso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Estadísticas de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningStats quizResults={quizResults} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Progreso Detallado</CardTitle>
          </CardHeader>
          <CardContent>
            <UserProgress quizResults={quizResults} />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Historial de Respuestas Correctas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CorrectAnswersHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

