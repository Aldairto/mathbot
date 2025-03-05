"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { QuizInterface } from "@/components/quiz-interface"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

export default function QuizzesPage() {
  const [key, setKey] = useState(0)
  const { data: session } = useSession()

  const handleClearQuiz = async () => {
    if (session?.user?.id) {
      // Limpiar localStorage
      localStorage.removeItem(`quizState_${session.user.id}`)

      // Limpiar estado en el servidor
      try {
        await fetch("/api/user-quiz-state", { method: "DELETE" })
      } catch (error) {
        console.error("Error al limpiar el estado del cuestionario en el servidor:", error)
      }

      // Forzar recarga del componente
      setKey((prevKey) => prevKey + 1)
    }
  }

  return (
    <RouteGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cuestionarios</h1>
          <Button variant="outline" onClick={handleClearQuiz}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar cuestionario
          </Button>
        </div>
        <QuizInterface key={key} />
      </div>
    </RouteGuard>
  )
}

