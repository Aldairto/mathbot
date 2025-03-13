import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "No autorizado" })
    }

    const userId = session.user.id

    if (req.method === "GET") {
      try {
        const quizState = await prisma.userQuizState.findUnique({
          where: { userId },
        })

        if (!quizState || !quizState.state) {
          return res.status(200).json(null)
        }

        try {
          const parsedState = JSON.parse(quizState.state)
          return res.status(200).json(parsedState)
        } catch (parseError) {
          console.error("Error al analizar JSON del estado del cuestionario:", parseError)
          return res.status(200).json(null) // Devolver null en lugar de fallar
        }
      } catch (error) {
        console.error("Error al obtener el estado del cuestionario:", error)
        return res.status(200).json(null) // Devolver null en lugar de fallar
      }
    } else if (req.method === "POST") {
      const { state } = req.body

      if (!state) {
        return res.status(400).json({ error: "El estado es requerido" })
      }

      // Convertir el estado a string y verificar su tamaño
      const stateString = JSON.stringify(state)
      console.log(`Tamaño del estado del cuestionario: ${stateString.length} bytes`)

      // Definir un límite seguro para MySQL LONGTEXT (aproximadamente 4GB, pero usamos un límite mucho menor)
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
        await prisma.$transaction(async (tx) => {
          const existingState = await tx.userQuizState.findUnique({
            where: { userId },
          })

          if (existingState) {
            await tx.userQuizState.update({
              where: { userId },
              data: { state: processedState },
            })
          } else {
            await tx.userQuizState.create({
              data: { userId, state: processedState },
            })
          }
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
      try {
        await prisma.userQuizState
          .delete({
            where: { userId },
          })
          .catch((error) => {
            // Si el registro no existe, simplemente ignorar el error
            if (error.code !== "P2025") throw error
          })

        res.status(200).json({ message: "Estado del cuestionario eliminado" })
      } catch (error) {
        console.error("Error al eliminar el estado:", error)
        res.status(500).json({ error: "Error al eliminar el estado" })
      }
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error general en user-quiz-state:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

