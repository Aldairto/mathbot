"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { InlineMath, BlockMath } from "react-katex"
import { Progress } from "@/components/ui/progress"
import "katex/dist/katex.min.css"

const topics = {
  "1.1 Álgebra": [
    "Razones",
    "Proporciones",
    "Sucesiones",
    "Series",
    "Polinomios",
    "Ecuaciones lineales y ecuaciones cuadráticas",
  ],
  "1.2 Probabilidad y estadística": ["Estadística descriptiva", "Probabilidad"],
  "1.3 Geometría y trigonometría": [
    "Triángulos",
    "Polígonos",
    "Poliedros",
    "Circunferencia y círculo",
    "Triángulos rectángulos",
    "Triángulos oblicuángulos",
  ],
  "1.4 Geometría analítica": [
    "Lugar geométrico de rectas y curvas",
    "Pendiente y ángulo de inclinación",
    "Ecuación de la recta, de la circunferencia y de la parábola",
  ],
  "1.5 Funciones": ["Relaciones y funciones", "Graficación de funciones", "Función lineal", "Funciones cuadráticas"],
}

type Question = {
  question: string
  options: string[]
  correctAnswer: string
  userAnswer?: string
  explanation?: string
}

export function QuizInterface() {
  const { data: session } = useSession()
  const [selectedMainTopic, setSelectedMainTopic] = useState("")
  const [selectedSubTopic, setSelectedSubTopic] = useState("")
  const [quiz, setQuiz] = useState<Question[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [attemptCount, setAttemptCount] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"all" | "one-by-one">("all")
  const [isLoadingExplanations, setIsLoadingExplanations] = useState(false)

  const loadQuizState = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      // Primero, intentamos cargar desde localStorage
      const localState = localStorage.getItem(`quizState_${session.user.id}`)
      if (localState) {
        const parsedState = JSON.parse(localState)
        setQuiz(parsedState.quiz)
        setSelectedMainTopic(parsedState.selectedMainTopic)
        setSelectedSubTopic(parsedState.selectedSubTopic)
        setShowResults(parsedState.showResults)
        setAttemptCount(parsedState.attemptCount)
        setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0)
        setViewMode(parsedState.viewMode || "all")
      }

      // Luego, intentamos cargar desde el servidor
      const response = await fetch("/api/user-quiz-state")
      if (response.ok) {
        const serverState = await response.json()
        if (
          serverState &&
          (!localState || new Date(serverState.updatedAt) > new Date(JSON.parse(localState).updatedAt))
        ) {
          // Si el estado del servidor es más reciente, lo usamos
          setQuiz(serverState.quiz)
          setSelectedMainTopic(serverState.selectedMainTopic)
          setSelectedSubTopic(serverState.selectedSubTopic)
          setShowResults(serverState.showResults)
          setAttemptCount(serverState.attemptCount)
          setCurrentQuestionIndex(serverState.currentQuestionIndex || 0)
          setViewMode(serverState.viewMode || "all")

          // Actualizamos localStorage con el estado más reciente
          localStorage.setItem(
            `quizState_${session.user.id}`,
            JSON.stringify({
              ...serverState,
              updatedAt: new Date().toISOString(),
            }),
          )
        }
      }
    } catch (error) {
      console.error("Error al cargar el estado del cuestionario:", error)
    }
  }, [session?.user?.id])

  const saveQuizState = useCallback(async () => {
    if (!session?.user?.id || !quiz) return

    try {
      const state = {
        quiz,
        selectedMainTopic,
        selectedSubTopic,
        showResults,
        attemptCount,
        currentQuestionIndex,
        viewMode,
        updatedAt: new Date().toISOString(),
      }

      // Guardamos en localStorage
      localStorage.setItem(`quizState_${session.user.id}`, JSON.stringify(state))

      // Guardamos en el servidor
      await fetch("/api/user-quiz-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      })
    } catch (error) {
      console.error("Error al guardar el estado en el servidor:", error)
    }
  }, [
    session?.user?.id,
    quiz,
    selectedMainTopic,
    selectedSubTopic,
    showResults,
    attemptCount,
    currentQuestionIndex,
    viewMode,
  ])

  useEffect(() => {
    loadQuizState()
  }, [loadQuizState])

  useEffect(() => {
    if (quiz) {
      saveQuizState()
    }
  }, [saveQuizState, quiz, currentQuestionIndex, viewMode])

  const handleGenerateQuiz = async () => {
    if (!selectedMainTopic || !selectedSubTopic) return

    setIsLoading(true)
    setError(null)
    setQuiz(null)
    setShowResults(false)
    setAttemptCount(1)
    setCurrentQuestionIndex(0)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generateQuiz: true,
          mainTopic: selectedMainTopic,
          subTopic: selectedSubTopic,
          includeCorrectAnswer: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Ocurrió un error desconocido")
      }

      const data = await response.json()
      const parsedQuiz = parseQuizContent(data.content)
      setQuiz(parsedQuiz)
      setRefreshKey((prevKey) => prevKey + 1)
    } catch (error) {
      console.error("Error al generar cuestionario:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  // Mejorar la función parseQuizContent para manejar mejor el formato de las opciones
  const parseQuizContent = (content: string): Question[] => {
    const questions = content.split(/\d+\.\s/).filter((q) => q.trim() !== "")
    return questions.map((q) => {
      const lines = q.split("\n").filter((line) => line.trim() !== "")
      const questionText = lines[0].trim()

      // Buscar la línea que contiene "Respuesta correcta:"
      const correctAnswerLineIndex = lines.findIndex((line) => line.toLowerCase().includes("respuesta correcta:"))

      if (correctAnswerLineIndex === -1) {
        console.error("No se encontró la respuesta correcta para la pregunta:", questionText)
        return {
          question: questionText,
          options: lines.slice(1, 5).map((o) => o.replace(/^[A-Da-d][\)\.]?\s*([a-d][\)\.]?)?\s*/, "").trim()),
          correctAnswer: "a", // Valor predeterminado
          userAnswer: "",
          explanation: "",
        }
      }

      // Extraer opciones hasta la línea de respuesta correcta
      const options = lines.slice(1, correctAnswerLineIndex).map((o) => {
        // Eliminar cualquier formato de letra como "A) a)" o "a)" o "A."
        return o.replace(/^[A-Da-d][\)\.]?\s*([a-d][\)\.]?)?\s*/, "").trim()
      })

      // Extraer la respuesta correcta
      const correctAnswerLine = lines[correctAnswerLineIndex]
      const correctAnswerMatch = correctAnswerLine.match(/respuesta correcta:\s*([a-d])/i)
      const correctAnswer = correctAnswerMatch
        ? correctAnswerMatch[1].toLowerCase()
        : correctAnswerLine
            .replace(/respuesta correcta:\s*/i, "")
            .trim()
            .toLowerCase()

      // Buscar explicación después de la respuesta correcta
      let explanation = ""

      // Buscar la línea que comienza con "Explicación:"
      const explanationLineIndex = lines.findIndex(
        (line, idx) => idx > correctAnswerLineIndex && line.toLowerCase().includes("explicación:"),
      )

      if (explanationLineIndex !== -1) {
        // Eliminar el prefijo "Explicación:" y cualquier duplicado
        explanation = lines
          .slice(explanationLineIndex)
          .join("\n")
          .replace(/^explicación:\s*(explicación:)?\s*/i, "")
          .trim()
      } else if (correctAnswerLineIndex < lines.length - 1) {
        // Si no hay una línea específica, tomar todo lo que sigue después de la respuesta correcta
        explanation = lines
          .slice(correctAnswerLineIndex + 1)
          .join("\n")
          .trim()
          .replace(/^explicación:\s*(explicación:)?\s*/i, "")
          .trim()
      }

      return {
        question: questionText,
        options,
        correctAnswer: correctAnswer.length === 1 ? correctAnswer : "a", // Fallback to 'a' if not a single letter
        userAnswer: "",
        explanation,
      }
    })
  }

  const handleAnswerChange = async (questionIndex: number, answer: string) => {
    if (!quiz) return

    const updatedQuiz = quiz.map((q, index) => (index === questionIndex ? { ...q, userAnswer: answer } : q))
    setQuiz(updatedQuiz)

    const currentQuestion = updatedQuiz[questionIndex]
    const isCorrect = currentQuestion.correctAnswer === answer

    try {
      await fetch("/api/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainTopic: selectedMainTopic,
          subTopic: selectedSubTopic,
          correct: isCorrect,
          question: currentQuestion.question,
          userAnswer: currentQuestion.options[answer.charCodeAt(0) - 97],
          correctAnswer: currentQuestion.options[currentQuestion.correctAnswer.charCodeAt(0) - 97],
        }),
      })
    } catch (error) {
      console.error("Error al guardar el resultado:", error)
    }
  }

  // Versión mejorada de handleSubmitQuiz
  const handleSubmitQuiz = async () => {
    if (!quiz) return

    setShowResults(true)
    
    // Primero, generar explicaciones para todas las preguntas
    await generateMissingExplanations()
    
    // Ahora que tenemos las explicaciones, filtrar las preguntas correctas
    const correctQuestions = quiz.filter((q) => q.correctAnswer.toLowerCase() === q.userAnswer?.toLowerCase())

    if (correctQuestions.length > 0) {
      try {
        // Depuración para verificar las explicaciones antes de enviar
        console.log("Enviando respuestas correctas con explicaciones:", 
          correctQuestions.map(q => ({
            question: q.question.substring(0, 20) + "...",
            hasExplanation: !!q.explanation,
            explanationLength: q.explanation ? q.explanation.length : 0,
            explanation: q.explanation ? q.explanation.substring(0, 30) + "..." : "NO EXPLANATION"
          }))
        )

        const response = await fetch("/api/correct-answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correctAnswers: correctQuestions.map((q) => ({
              question: q.question,
              answer: q.options[q.correctAnswer.charCodeAt(0) - 97],
              explanation: q.explanation || "", // Asegurarse de incluir la explicación
              mainTopic: selectedMainTopic,
              subTopic: selectedSubTopic,
            })),
          }),
        })
        
        const result = await response.json()
        console.log("Respuesta del servidor al guardar respuestas correctas:", result)
      } catch (error) {
        console.error("Error al guardar las respuestas correctas:", error)
      }
    }
  }

  // Versión mejorada de generateMissingExplanations
  const generateMissingExplanations = async () => {
    if (!quiz) return

    // Generar explicaciones para TODAS las preguntas que no las tienen
    const questionsWithoutExplanations = quiz.filter((q) => !q.explanation || q.explanation.trim() === "")
    
    if (questionsWithoutExplanations.length === 0) {
      console.log("Todas las preguntas ya tienen explicaciones")
      return
    }

    console.log(`Generando explicaciones para ${questionsWithoutExplanations.length} preguntas`)
    setIsLoadingExplanations(true)

    try {
      const updatedQuiz = [...quiz]

      for (let i = 0; i < questionsWithoutExplanations.length; i++) {
        const questionIndex = quiz.findIndex((q) => q === questionsWithoutExplanations[i])
        if (questionIndex === -1) continue

        const question = quiz[questionIndex]
        const correctOptionText = question.options[question.correctAnswer.charCodeAt(0) - 97]

        console.log(`Generando explicación para pregunta ${i+1}/${questionsWithoutExplanations.length}: "${question.question.substring(0, 30)}..."`)

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "Eres un asistente especializado en explicar conceptos matemáticos de manera clara y concisa.",
              },
              {
                role: "user",
                content: `Explica por qué la respuesta correcta a esta pregunta es "${correctOptionText}". La pregunta es: "${question.question}". Las opciones son: ${question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(", ")}.`,
              },
            ],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const explanation = data.content.trim()
          
          console.log(`Explicación generada (${explanation.length} caracteres): "${explanation.substring(0, 50)}..."`)
          
          updatedQuiz[questionIndex] = {
            ...updatedQuiz[questionIndex],
            explanation: explanation,
          }
        } else {
          console.error(`Error al generar explicación para pregunta ${i+1}:`, await response.text())
        }
      }

      // Actualizar el estado del quiz con las explicaciones generadas
      setQuiz(updatedQuiz)
      
      // Depuración para verificar las explicaciones generadas
      console.log("Explicaciones generadas:", 
        updatedQuiz.map(q => ({
          question: q.question.substring(0, 20) + "...",
          hasExplanation: !!q.explanation,
          explanationLength: q.explanation ? q.explanation.length : 0,
          explanation: q.explanation ? q.explanation.substring(0, 30) + "..." : "NO EXPLANATION"
        }))
      )
      
      return updatedQuiz; // Devolver el quiz actualizado para que handleSubmitQuiz pueda usarlo
    } catch (error) {
      console.error("Error al generar explicaciones:", error)
    } finally {
      setIsLoadingExplanations(false)
    }
  }

  const handleRetakeQuiz = () => {
    setShowResults(false)
    setAttemptCount((prevCount) => prevCount + 1)
    setCurrentQuestionIndex(0)
    setQuiz((prevQuiz) => (prevQuiz ? prevQuiz.map((q) => ({ ...q, userAnswer: "" })) : null))
  }

  const calculateScore = () => {
    if (!quiz) return 0
    return quiz.reduce((score, question) => {
      return score + (question.correctAnswer === question.userAnswer ? 1 : 0)
    }, 0)
  }

  const renderMathExpression = (text: string) => {
    if (!text) return null

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

  const handleNextQuestion = () => {
    if (!quiz) return
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "all" ? "one-by-one" : "all")
  }

  const getAnsweredQuestionsCount = () => {
    if (!quiz) return 0
    return quiz.filter((q) => q.userAnswer).length
  }

  useEffect(() => {
    if (quiz) {
      setRefreshKey((prevKey) => prevKey + 1)
    }
  }, [quiz])

  // Mejorar el renderizado de las opciones para evitar duplicación de letras
  const renderQuestion = (question: Question, index: number) => (
    <div key={`${index}-${refreshKey}`} className="mb-8 p-4 bg-secondary/30 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {index + 1}. {renderMathExpression(question.question)}
      </h3>
      <RadioGroup
        onValueChange={(value) => handleAnswerChange(index, value)}
        value={question.userAnswer}
        disabled={showResults}
        className="space-y-2"
      >
        {question.options.map((option, optionIndex) => {
          const optionLetter = String.fromCharCode(97 + optionIndex)
          const optionLetterUpper = String.fromCharCode(65 + optionIndex)
          const isCorrect = optionLetter === question.correctAnswer
          const isSelected = question.userAnswer === optionLetter
          return (
            <div
              key={`${optionIndex}-${refreshKey}`}
              className={`flex items-start space-x-2 p-2 rounded-md ${
                showResults
                  ? isCorrect
                    ? "bg-green-100 dark:bg-green-900/20"
                    : isSelected
                      ? "bg-red-100 dark:bg-red-900/20"
                      : "hover:bg-accent"
                  : "hover:bg-accent"
              }`}
            >
              <RadioGroupItem value={optionLetter} id={`q${index}-option${optionIndex}`} className="mt-1" />
              <Label
                htmlFor={`q${index}-option${optionIndex}`}
                className={`flex-grow cursor-pointer ${
                  showResults
                    ? isCorrect
                      ? "text-green-600 dark:text-green-400 font-semibold"
                      : isSelected
                        ? "text-red-600 dark:text-red-400"
                        : ""
                    : ""
                }`}
              >
                <div className="flex items-start">
                  <span className="mr-2">{optionLetterUpper})</span>
                  <div className="flex-1">{renderMathExpression(option)}</div>
                  {showResults && isCorrect && (
                    <CheckCircle2 className="text-green-600 dark:text-green-400 ml-2 h-5 w-5 flex-shrink-0" />
                  )}
                  {showResults && !isCorrect && isSelected && (
                    <XCircle className="text-red-600 dark:text-red-400 ml-2 h-5 w-5 flex-shrink-0" />
                  )}
                </div>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
      {showResults && (
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-md">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300">Explicación:</h4>
          <div className="text-blue-700 dark:text-blue-200">
            {isLoadingExplanations && !question.explanation ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Generando explicación...</span>
              </div>
            ) : question.explanation ? (
              renderMathExpression(question.explanation)
            ) : (
              `La respuesta correcta es la opción ${question.correctAnswer.toUpperCase()}.`
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col w-full h-full border rounded-lg overflow-hidden bg-background shadow-lg">
      <div className="p-4 space-y-4 bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            onValueChange={(value) => {
              setSelectedMainTopic(value)
              setSelectedSubTopic("")
            }}
            value={selectedMainTopic}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tema principal" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(topics).map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMainTopic && (
            <Select onValueChange={setSelectedSubTopic} value={selectedSubTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un subtema" />
              </SelectTrigger>
              <SelectContent>
                {topics[selectedMainTopic as keyof typeof topics].map((subTopic) => (
                  <SelectItem key={subTopic} value={subTopic}>
                    {subTopic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex justify-between items-center">
          <Button onClick={handleGenerateQuiz} disabled={!selectedMainTopic || !selectedSubTopic || isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Generar Cuestionario
          </Button>
          {quiz && (
            <Button variant="outline" onClick={toggleViewMode}>
              {viewMode === "all" ? "Ver pregunta por pregunta" : "Ver todas las preguntas"}
            </Button>
          )}
        </div>
      </div>

      {quiz && (
        <div className="px-4 py-2 bg-muted/10 border-t border-b">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Respondidas: {getAnsweredQuestionsCount()} de {quiz.length}
            </div>
            {viewMode === "one-by-one" && (
              <div className="text-sm font-medium">
                Pregunta {currentQuestionIndex + 1} de {quiz.length}
              </div>
            )}
          </div>
          <Progress value={(getAnsweredQuestionsCount() / quiz.length) * 100} className="h-2 mt-1" />
        </div>
      )}

      <ScrollArea className="flex-grow p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quiz && (
          <Card className="mb-4" key={refreshKey}>
            <CardHeader>
              <CardTitle>
                Cuestionario: {selectedMainTopic} - {selectedSubTopic}
              </CardTitle>
              <CardDescription>
                {showResults ? "Revisa tus respuestas y la retroalimentación:" : "Responde a las siguientes preguntas:"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {viewMode === "all"
                ? // Mostrar todas las preguntas
                  quiz.map((question, index) => renderQuestion(question, index))
                : // Mostrar una pregunta a la vez
                  quiz[currentQuestionIndex] && renderQuestion(quiz[currentQuestionIndex], currentQuestionIndex)}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4">
              {viewMode === "one-by-one" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === quiz.length - 1}
                  >
                    Siguiente
                  </Button>
                </div>
              )}

              {!showResults ? (
                <Button
                  onClick={handleSubmitQuiz}
                  className="w-full sm:w-auto"
                  disabled={getAnsweredQuestionsCount() < quiz.length}
                >
                  {getAnsweredQuestionsCount() < quiz.length
                    ? `Faltan ${quiz.length - getAnsweredQuestionsCount()} respuestas`
                    : "Enviar respuestas"}
                </Button>
              ) : (
                <div className="w-full space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-xl font-bold">Resultados (Intento {attemptCount})</h3>
                    <p className="text-lg">
                      Puntuación: {calculateScore()} de {quiz.length} (
                      {((calculateScore() / quiz.length) * 100).toFixed(2)}%)
                    </p>
                  </div>
                  <Button onClick={handleRetakeQuiz} className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" /> Volver a resolver
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        )}
      </ScrollArea>
    </div>
  )
}