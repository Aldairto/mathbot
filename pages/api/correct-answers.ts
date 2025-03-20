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

      // Depuración para verificar los datos recibidos
      console.log("Datos recibidos para guardar:", 
        correctAnswers.map((a: any) => ({
          question: a.question.substring(0, 20) + "...",
          hasExplanation: !!a.explanation,
          explanationLength: a.explanation ? a.explanation.length : 0
        }))
      )

      const savedAnswers = await prisma.correctAnswer.createMany({
        data: correctAnswers.map((answer: any) => ({
          question: answer.question,
          answer: answer.answer,
          explanation: answer.explanation || null, // Manejar explícitamente el campo de explicación
          mainTopic: answer.mainTopic,
          subTopic: answer.subTopic,
          userId,
        })),
      })

      res.status(200).json({ message: "Respuestas correctas guardadas", count: savedAnswers.count })
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error en el manejo de respuestas correctas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

