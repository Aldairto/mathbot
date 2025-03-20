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
      // Asegurarse de incluir el campo explanation en la consulta
      const correctAnswers = await prisma.correctAnswer.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          question: true,
          answer: true,
          explanation: true, // Asegurarse de seleccionar este campo
          mainTopic: true,
          subTopic: true,
          createdAt: true,
        },
        take: 50, // Limitar a las últimas 50 respuestas correctas
      })

      // Depuración para verificar si las explicaciones están presentes
      console.log("Respuestas correctas enviadas:", 
        correctAnswers.map(a => ({
          id: a.id,
          hasExplanation: !!a.explanation,
          explanationLength: a.explanation ? a.explanation.length : 0
        }))
      )

      res.status(200).json({ correctAnswers })
    } else if (req.method === "POST") {
      const { correctAnswers } = req.body

      if (!Array.isArray(correctAnswers)) {
        return res.status(400).json({ error: "correctAnswers debe ser un array" })
      }

      // Depuración detallada para verificar los datos recibidos
      console.log("Datos recibidos para guardar:", 
        correctAnswers.map((a: any) => ({
          question: a.question.substring(0, 20) + "...",
          hasExplanation: !!a.explanation,
          explanationLength: a.explanation ? a.explanation.length : 0,
          explanation: a.explanation ? a.explanation.substring(0, 30) + "..." : "NO EXPLANATION"
        }))
      )

      // Verificar si hay explicaciones vacías y registrarlas
      const emptyExplanations = correctAnswers.filter((a: any) => !a.explanation || a.explanation.trim() === "")
      if (emptyExplanations.length > 0) {
        console.warn(`ADVERTENCIA: ${emptyExplanations.length} respuestas no tienen explicación`)
        
        // Agregar explicaciones predeterminadas para evitar valores nulos
        correctAnswers.forEach((answer: any) => {
          if (!answer.explanation || answer.explanation.trim() === "") {
            answer.explanation = `La respuesta correcta es: ${answer.answer}`
          }
        })
      }

      try {
        // Usar $transaction con create individual para mejor control y depuración
        const savedAnswers = await prisma.$transaction(
          correctAnswers.map((answer: any) => {
            // Registrar cada operación de creación
            console.log(`Creando respuesta correcta: "${answer.question.substring(0, 20)}..." con explicación: ${answer.explanation ? "SÍ" : "NO"}`)
            
            return prisma.correctAnswer.create({
              data: {
                question: answer.question,
                answer: answer.answer,
                explanation: answer.explanation || `La respuesta correcta es: ${answer.answer}`, // Nunca permitir null
                mainTopic: answer.mainTopic,
                subTopic: answer.subTopic,
                userId,
              },
            })
          })
        )

        // Verificar las respuestas guardadas
        console.log("Respuestas guardadas en la base de datos:", 
          savedAnswers.map(a => ({
            id: a.id,
            hasExplanation: !!a.explanation,
            explanationLength: a.explanation ? a.explanation.length : 0
          }))
        )

        res.status(200).json({ 
          message: "Respuestas correctas guardadas", 
          count: savedAnswers.length,
          savedAnswers: savedAnswers.map(a => ({
            id: a.id,
            hasExplanation: !!a.explanation,
            explanationLength: a.explanation ? a.explanation.length : 0
          }))
        })
      } catch (error) {
        console.error("Error al guardar respuestas correctas:", error)
        res.status(500).json({ error: "Error al guardar respuestas correctas", details: error.message })
      }
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error en el manejo de respuestas correctas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}