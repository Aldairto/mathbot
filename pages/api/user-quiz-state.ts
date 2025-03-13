import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: "No autorizado" })
  }

  const userId = session.user.id

  try {
    if (req.method === "GET") {
      const quizState = await prisma.userQuizState.findUnique({
        where: { userId },
      })
      res.status(200).json(quizState?.state ? JSON.parse(quizState.state) : null)
    } else if (req.method === "POST") {
      const { state } = req.body

      // Convertir el estado a string y verificar su tamaño
      const stateString = JSON.stringify(state)

      // Definir un límite seguro para MySQL TEXT (aproximadamente 16MB para LONGTEXT)
      const SAFE_LIMIT = 10 * 1024 * 1024 // 10MB como límite seguro

      // Si el estado es demasiado grande, simplificarlo
      let processedState = stateString
      if (stateString.length > SAFE_LIMIT) {
        console.log(`Estado demasiado grande: ${stateString.length} bytes. Simplificando...`)

        // Simplificar el estado para reducir su tamaño
        const simplifiedState = {
          selectedMainTopic: state.selectedMainTopic,
          selectedSubTopic: state.selectedSubTopic,
          showResults: state.showResults,
          attemptCount: state.attemptCount,
          // Simplificar el quiz para reducir el tamaño
          quiz: state.quiz
            ? state.quiz.map((q: any) => ({
                question: q.question.substring(0, 500), // Limitar longitud de preguntas
                correctAnswer: q.correctAnswer,
                userAnswer: q.userAnswer,
                // Limitar las opciones a 100 caracteres cada una
                options: q.options
                  ? q.options.map((opt: string) => (opt.length > 100 ? opt.substring(0, 100) + "..." : opt))
                  : [],
              }))
            : [],
          updatedAt: new Date().toISOString(),
        }
        processedState = JSON.stringify(simplifiedState)

        // Si aún es demasiado grande, tomar medidas más drásticas
        if (processedState.length > SAFE_LIMIT) {
          console.log(
            `Estado aún demasiado grande después de simplificar: ${processedState.length} bytes. Reduciendo más...`,
          )
          const minimalState = {
            selectedMainTopic: state.selectedMainTopic,
            selectedSubTopic: state.selectedSubTopic,
            showResults: state.showResults,
            attemptCount: state.attemptCount,
            quiz: state.quiz
              ? state.quiz.slice(0, 2).map((q: any) => ({
                  question: q.question.substring(0, 100),
                  correctAnswer: q.correctAnswer,
                  userAnswer: q.userAnswer,
                  options: q.options ? q.options.map((opt: string) => opt.substring(0, 50)) : [],
                }))
              : [],
            updatedAt: new Date().toISOString(),
            error: "Estado demasiado grande para almacenar completamente",
          }
          processedState = JSON.stringify(minimalState)
        }

        console.log(`Tamaño final del estado procesado: ${processedState.length} bytes`)
      }

      try {
        const updatedQuizState = await prisma.userQuizState.upsert({
          where: { userId },
          update: { state: processedState },
          create: { userId, state: processedState },
        })
        res.status(200).json({ success: true, message: "Estado guardado correctamente" })
      } catch (error) {
        console.error("Error al guardar el estado:", error)
        res.status(500).json({
          error: "Error al guardar el estado",
          details: error.message,
          stateLength: processedState.length,
        })
      }
    } else if (req.method === "DELETE") {
      await prisma.userQuizState.delete({
        where: { userId },
      })
      res.status(200).json({ message: "Estado del cuestionario eliminado" })
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error en user-quiz-state:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

