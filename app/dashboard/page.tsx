"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserProgress } from "@/components/user-progress"
import { LearningStats } from "@/components/learning-stats"
import { CorrectAnswersHistory } from "@/components/correct-answers-history"
import StudyTimeDisplay from "@/components/study-time-display"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, BookOpen, Calendar, Clock, Download, GraduationCap, LineChart, RefreshCw, Trophy } from 'lucide-react'
import Link from "next/link"

type QuizResult = {
  mainTopic: string
  subTopic: string
  correctCount: number
  incorrectCount: number
  timestamp?: string
}

type TopicProgress = {
  topic: string
  progress: number
  totalQuestions: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session?.user && 'id' in session.user) {
      fetchQuizResults()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchQuizResults = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/quiz-results")
      if (!response.ok) {
        throw new Error(`Error al obtener los resultados: ${response.status}`)
      }
      
      const data = await response.json()
      const results = data.results || data || []
      setQuizResults(results)
      
      // Calcular progreso por tema principal
      calculateTopicProgress(results)
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error("Error al obtener los resultados de los cuestionarios:", error)
      setError(error.message || "Error al cargar los datos")
      setQuizResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTopicProgress = (results: QuizResult[]) => {
    // Agrupar resultados por tema principal
    const topicGroups = results.reduce((groups: Record<string, QuizResult[]>, result) => {
      const topic = result.mainTopic
      if (!groups[topic]) {
        groups[topic] = []
      }
      groups[topic].push(result)
      return groups
    }, {})

    // Calcular progreso para cada tema
    const progress = Object.entries(topicGroups).map(([topic, results]) => {
      const totalQuestions = results.reduce(
        (sum, result) => sum + result.correctCount + result.incorrectCount, 
        0
      )
      const correctQuestions = results.reduce(
        (sum, result) => sum + result.correctCount, 
        0
      )
      return {
        topic,
        progress: totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0,
        totalQuestions
      }
    })

    setTopicProgress(progress)
  }

  const calculateTotalProgress = () => {
    if (!quizResults || !Array.isArray(quizResults) || quizResults.length === 0) {
      return 0
    }

    const totalQuestions = quizResults.reduce(
      (sum, result) => sum + result.correctCount + result.incorrectCount, 
      0
    )
    const correctQuestions = quizResults.reduce(
      (sum, result) => sum + result.correctCount, 
      0
    )
    return totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0
  }

  const getTotalQuestionsAnswered = () => {
    if (!quizResults || !Array.isArray(quizResults)) return 0
    return quizResults.reduce(
      (sum, result) => sum + result.correctCount + result.incorrectCount, 
      0
    )
  }

  const getTotalCorrectAnswers = () => {
    if (!quizResults || !Array.isArray(quizResults)) return 0
    return quizResults.reduce((sum, result) => sum + result.correctCount, 0)
  }

  const getMostStudiedTopic = () => {
    if (!topicProgress.length) return "Ninguno aún"
    
    const sorted = [...topicProgress].sort((a, b) => b.totalQuestions - a.totalQuestions)
    return sorted[0].topic
  }

  const getRecommendedTopic = () => {
    if (!topicProgress.length) return "Comienza con cualquier tema"
    
    // Recomendar el tema con menor progreso que tenga al menos algunas preguntas respondidas
    const withSomeProgress = topicProgress.filter(t => t.totalQuestions > 0)
    if (!withSomeProgress.length) return "Comienza con cualquier tema"
    
    const sorted = [...withSomeProgress].sort((a, b) => a.progress - b.progress)
    return sorted[0].topic
  }

  const handleExportData = () => {
    if (!quizResults.length) return
    
    const dataStr = JSON.stringify(quizResults, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    
    const exportFileDefaultName = `math-progress-${new Date().toISOString().slice(0, 10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
    return (
      <div className="container py-8">
        <Alert className="mb-6">
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            Por favor, inicia sesión para ver tu dashboard de progreso.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Mi Avance</h1>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchQuizResults}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportData}
            disabled={!quizResults.length}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar datos
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Bienvenido, {session?.user?.name || "Estudiante"}</CardTitle>
              <CardDescription>
                Aquí tienes un resumen de tu progreso en el aprendizaje de matemáticas
              </CardDescription>
            </div>
            <StudyTimeDisplay />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preguntas respondidas</p>
                <p className="text-2xl font-bold">{getTotalQuestionsAnswered()}</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg flex items-center">
              <div className="bg-green-500/10 p-3 rounded-full mr-3">
                <Trophy className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Respuestas correctas</p>
                <p className="text-2xl font-bold">{getTotalCorrectAnswers()}</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg flex items-center">
              <div className="bg-blue-500/10 p-3 rounded-full mr-3">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tema más estudiado</p>
                <p className="text-lg font-bold truncate">{getMostStudiedTopic()}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Progreso General</h3>
            <Progress 
              value={calculateTotalProgress()} 
              className="w-full h-4 mb-2" 
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <p>Has completado el {calculateTotalProgress().toFixed(1)}% del curso</p>
              {lastUpdated && (
                <p className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Actualizado: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="progress" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            Progreso
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Progreso Detallado</CardTitle>
                <CardDescription>Tu avance por temas</CardDescription>
              </CardHeader>
              <CardContent>
                <UserProgress quizResults={quizResults} />
              </CardContent>
              {topicProgress.length > 0 && (
                <CardFooter>
                  <div className="w-full p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Recomendación</h4>
                    <p className="text-sm text-muted-foreground">
                      Te recomendamos enfocarte en: <span className="font-bold">{getRecommendedTopic()}</span>
                    </p>
                  </div>
                </CardFooter>
              )}
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Estadísticas de Aprendizaje</CardTitle>
                <CardDescription>Análisis de tu desempeño</CardDescription>
              </CardHeader>
              <CardContent>
                <LearningStats quizResults={quizResults} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/quizzes">
                    Practicar más cuestionarios
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Análisis de Desempeño</CardTitle>
              <CardDescription>Estadísticas detalladas de tu aprendizaje</CardDescription>
            </CardHeader>
            <CardContent>
              {quizResults.length > 0 ? (
                <div className="space-y-6">
                  <LearningStats quizResults={quizResults} showExtended={true} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay suficientes datos para mostrar estadísticas.
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/quizzes">Comenzar a practicar</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Historial de Respuestas Correctas</CardTitle>
              <CardDescription>Revisa tus respuestas correctas para reforzar tu aprendizaje</CardDescription>
            </CardHeader>
            <CardContent>
              <CorrectAnswersHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}