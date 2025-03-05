"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { InlineMath, BlockMath } from "react-katex"
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

  const loadQuizState = useCallback(async () => {
    if (session?.user?.id) {
      // Primero, intentamos cargar desde localStorage
      const localState = localStorage.getItem(`quizState_${session.user.id}`)
      if (localState) {
        const parsedState = JSON.parse(localState)
        setQuiz(parsedState.quiz)
        setSelectedMainTopic(parsedState.selectedMainTopic)
        setSelectedSubTopic(parsedState.selectedSubTopic)
        setShowResults(parsedState.showResults)
        setAttemptCount(parsedState.attemptCount)
      }

      // Luego, intentamos cargar desde el servidor
      try {
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
        console.error("Error al cargar el estado del servidor:", error)
      }
    }
  }, [session?.user?.id])

  const saveQuizState = useCallback(async () => {
    if (session?.user?.id) {
      const state = {
        quiz,
        selectedMainTopic,
        selectedSubTopic,
        showResults,
        attemptCount,
        updatedAt: new Date().toISOString(),
      }
      // Guardamos en localStorage
      localStorage.setItem(`quizState_${session.user.id}`, JSON.stringify(state))

      // Guardamos en el servidor
      try {
        await fetch("/api/user-quiz-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        })
      } catch (error) {
        console.error("Error al guardar el estado en el servidor:", error)
      }
    }
  }, [session?.user?.id, quiz, selectedMainTopic, selectedSubTopic, showResults, attemptCount])

  useEffect(() => {
    loadQuizState()
  }, [loadQuizState])

  useEffect(() => {
    if (quiz) {
      saveQuizState()
    }
  }, [saveQuizState, quiz])

  const handleGenerateQuiz = async () => {
    if (!selectedMainTopic || !selectedSubTopic) return

    setIsLoading(true)
    setError(null)
    setQuiz(null)
    setShowResults(false)
    setAttemptCount(1)

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
          includeCorrectAnswer: true, // Indicar que queremos la respuesta correcta explícitamente
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error desconocido")
      }

      console.log("Contenido original del cuestionario:", data.content)
      const parsedQuiz = parseQuizContent(data.content)
      console.log("Cuestionario parseado:", parsedQuiz)
      setQuiz(parsedQuiz)
      setRefreshKey((prevKey) => prevKey + 1)
    } catch (error) {
      console.error("Error al generar cuestionario:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const parseQuizContent = (content: string): Question[] => {
    // Dividir el contenido en preguntas individuales
    const questionBlocks = content.split(/\n\s*\d+\.\s+/).filter((block) => block.trim().length > 0)

    return questionBlocks.map((block) => {
      // Dividir el bloque en líneas y limpiar espacios en blanco
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      // La primera línea es la pregunta
      const questionText = lines[0].trim()

      // Extraer las opciones y la respuesta correcta
      const options: string[] = []
      let correctAnswer = ""
      const correctAnswerText = ""

      // Recorrer las líneas buscando opciones y respuesta
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Buscar opciones que comienzan con a), b), c), d)
        const optionMatch = line.match(/^([a-d])\)(.*)/i)
        if (optionMatch) {
          const [, letter, text] = optionMatch
          const index = letter.toLowerCase().charCodeAt(0) - 97 // Convertir a -> 0, b -> 1, etc.
          options[index] = text.trim()
        }

        // Buscar la respuesta correcta
        if (line.toLowerCase().includes("respuesta correcta")) {
          // Extraer la letra de la respuesta correcta
          const letterMatch = line.match(/respuesta correcta:\s*([a-d])/i)
          if (letterMatch) {
            correctAnswer = letterMatch[1].toLowerCase()
            console.log(`Respuesta correcta identificada: ${correctAnswer}`)
          }
        }
      }

      // Verificar que tenemos todas las opciones
      if (options.length !== 4) {
        console.error("No se encontraron las 4 opciones para la pregunta:", questionText)
        // Rellenar opciones faltantes si es necesario
        while (options.length < 4) {
          options.push(`Opción ${String.fromCharCode(97 + options.length)}`)
        }
      }

      // Verificar que tenemos una respuesta correcta válida
      if (!["a", "b", "c", "d"].includes(correctAnswer)) {
        console.error("No se encontró una respuesta correcta válida para la pregunta:", questionText)
        correctAnswer = "a" // Valor por defecto
      }

      return {
        question: questionText,
        options: options,
        correctAnswer: correctAnswer,
        userAnswer: "",
      }
    })
  }

  const handleAnswerChange = async (questionIndex: number, answer: string) => {
    if (!quiz) return

    const updatedQuiz = quiz.map((q, index) => (index === questionIndex ? { ...q, userAnswer: answer } : q))
    setQuiz(updatedQuiz)

    const currentQuestion = updatedQuiz[questionIndex]
    const isCorrect = currentQuestion.correctAnswer.toLowerCase() === answer.toLowerCase()

    console.log(`Pregunta ${questionIndex + 1}:`)
    console.log(`- Respuesta del usuario: ${answer}`)
    console.log(`- Respuesta correcta: ${currentQuestion.correctAnswer}`)
    console.log(`- ¿Es correcta?: ${isCorrect}`)
    console.log(`- Opciones:`, currentQuestion.options)

    // Obtener el texto de la opción seleccionada
    const selectedOptionIndex = answer.charCodeAt(0) - 97
    const selectedOptionText =
      selectedOptionIndex >= 0 && selectedOptionIndex < currentQuestion.options.length
        ? currentQuestion.options[selectedOptionIndex]
        : "Opción no encontrada"

    // Obtener el texto de la opción correcta
    const correctOptionIndex = currentQuestion.correctAnswer.charCodeAt(0) - 97
    const correctOptionText =
      correctOptionIndex >= 0 && correctOptionIndex < currentQuestion.options.length
        ? currentQuestion.options[correctOptionIndex]
        : "Opción no encontrada"

    try {
      const response = await fetch("/api/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainTopic: selectedMainTopic,
          subTopic: selectedSubTopic,
          correct: isCorrect,
          question: currentQuestion.question,
          userAnswer: selectedOptionText,
          correctAnswer: correctOptionText,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el resultado del cuestionario")
      }

      console.log("Resultado guardado correctamente")
    } catch (error) {
      console.error("Error al guardar el resultado:", error)
    }
  }

  const handleSubmitQuiz = async () => {
    setShowResults(true)
    const correctQuestions = quiz?.filter((q) => q.correctAnswer.toLowerCase() === q.userAnswer?.toLowerCase()) || []

    if (correctQuestions.length > 0) {
      try {
        await fetch("/api/correct-answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correctAnswers: correctQuestions.map((q) => ({
              question: q.question,
              answer: q.options[q.correctAnswer.charCodeAt(0) - 97],
              mainTopic: selectedMainTopic,
              subTopic: selectedSubTopic,
            })),
          }),
        })
      } catch (error) {
        console.error("Error al guardar las respuestas correctas:", error)
      }
    }
  }

  const handleRetakeQuiz = () => {
    setShowResults(false)
    setAttemptCount((prevCount) => prevCount + 1)
    setQuiz((prevQuiz) => (prevQuiz ? prevQuiz.map((q) => ({ ...q, userAnswer: "" })) : null))
  }

  const calculateScore = () => {
    if (!quiz) return 0
    return quiz.reduce((score, question) => {
      return score + (question.correctAnswer.toLowerCase() === question.userAnswer?.toLowerCase() ? 1 : 0)
    }, 0)
  }

  const renderMathExpression = (text: string, isCorrect = false, isIncorrect = false) => {
    if (!text) return null
  
    // Solución simple: Agregar espacios alrededor de los delimitadores LaTeX
    let processedText = text
  
    // Agregar espacios alrededor de los delimitadores $ si no los tienen
    processedText = processedText.replace(/([^\s])\$/g, "$1 $")
    processedText = processedText.replace(/\$([^\s])/g, "$ $1")
  
    // Agregar espacios alrededor de los delimitadores $$ si no los tienen
    processedText = processedText.replace(/([^\s])\$\$/g, "$1 $$")
    processedText = processedText.replace(/\$\$([^\s])/g, "$$ $1")
  
    // Dividir el texto en partes matemáticas y no matemáticas
    const parts = processedText.split(/(\$\$.*?\$\$|\$.*?\$)/gs)
  
    // Determinar la clase de color basada en si es correcta o incorrecta
    const colorClass = isCorrect ? "text-green-600" : isIncorrect ? "text-red-600" : ""
  
    // Procesar cada parte y asegurar espacios adecuados
    const processedParts = parts.map(part => part.trim());
    
    return processedParts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        try {
          const math = part.slice(2, -2).trim()
          return (
            <span key={index} className={colorClass}>
              {/* Agregar un espacio antes de la expresión matemática */}
              {index > 0 && !processedParts[index - 1].endsWith("$") && " "}
              <BlockMath math={math} />
              {/* Agregar un espacio después de la expresión matemática */}
              {index < processedParts.length - 1 && !processedParts[index + 1].startsWith("$") && " "}
            </span>
          )
        } catch (error) {
          console.error(`Error al renderizar BlockMath: ${error}`)
          return (
            <span key={index} className="text-red-500">
              [Error en fórmula]
            </span>
          )
        }
      } else if (part.startsWith("$") && part.endsWith("$")) {
        try {
          const math = part.slice(1, -1).trim()
          return (
            <span key={index} className={colorClass}>
              {/* Agregar un espacio antes de la expresión matemática */}
              {index > 0 && !processedParts[index - 1].endsWith("$") && " "}
              <InlineMath math={math} />
              {/* Agregar un espacio después de la expresión matemática */}
              {index < processedParts.length - 1 && !processedParts[index + 1].startsWith("$") && " "}
            </span>
          )
        } catch (error) {
          console.error(`Error al renderizar InlineMath: ${error}`)
          return (
            <span key={index} className="text-red-500">
              [Error en fórmula]
            </span>
          )
        }
      } else if (part.length > 0) {
        return (
          <span key={index} className={colorClass}>
            {part}
          </span>
        )
      }
      return null
    })
  }

  useEffect(() => {
    if (quiz) {
      setRefreshKey((prevKey) => prevKey + 1)
    }
  }, [quiz])

  return (
    <div className="flex flex-col w-full h-full border rounded-lg overflow-hidden bg-background shadow-lg">
      <div className="p-4 space-y-4 bg-muted/20">
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
        <Button onClick={handleGenerateQuiz} disabled={!selectedMainTopic || !selectedSubTopic || isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Generar Cuestionario
        </Button>
      </div>
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
              <CardDescription>Responde a las siguientes preguntas:</CardDescription>
            </CardHeader>
            <CardContent>
              {quiz.map((question, index) => (
                <div key={`${index}-${refreshKey}`} className="mb-8 p-4 bg-secondary rounded-lg">
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
                      const isCorrect = optionLetter === question.correctAnswer
                      const isSelected = question.userAnswer === optionLetter
                      const isIncorrect = showResults && isSelected && !isCorrect
                      return (
                        <div
                          key={`${optionIndex}-${refreshKey}`}
                          className="flex items-start space-x-2 p-2 rounded-md hover:bg-accent"
                        >
                          <RadioGroupItem value={optionLetter} id={`q${index}-option${optionIndex}`} className="mt-1" />
                          <Label
                            htmlFor={`q${index}-option${optionIndex}`}
                            className={`flex-grow cursor-pointer ${isIncorrect ? "text-red-600 underline" : ""}`}
                          >
                            {optionLetter}) {renderMathExpression(option, showResults && isCorrect, isIncorrect)}
                            {showResults && isCorrect && (
                              <span className="ml-2 text-green-600 font-bold"> ✓ Correcto</span>
                            )}
                            {isIncorrect && <span className="ml-2 text-red-600 font-bold"> ✗ Incorrecto</span>}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                  {showResults && (
                    <div className="mt-4">
                      <span className="text-green-600">Respuesta correcta: {question.correctAnswer.toUpperCase()}</span>
                      {question.userAnswer === question.correctAnswer ? (
                        <span className="ml-4 text-green-600 font-bold">¡Has respondido correctamente!</span>
                      ) : question.userAnswer ? (
                        <span className="ml-4 text-red-600 font-bold">Respuesta incorrecta</span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              {!showResults ? (
                <Button onClick={handleSubmitQuiz} className="mt-4">
                  Enviar respuestas
                </Button>
              ) : (
                <div className="mt-4 space-y-4">
                  <h3 className="text-xl font-bold">Resultados (Intento {attemptCount})</h3>
                  <p>
                    Puntuación: {calculateScore()} de {quiz.length} (
                    {((calculateScore() / quiz.length) * 100).toFixed(2)}%)
                  </p>
                  <Button onClick={handleRetakeQuiz} className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" /> Volver a resolver
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  )
}

