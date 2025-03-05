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

  if (req.method === "POST") {
    const { mainTopic, subTopic, correct, question, userAnswer, correctAnswer } = req.body

    if (!mainTopic || !subTopic || typeof correct !== "boolean") {
      return res.status(400).json({ error: "Datos incompletos o inválidos" })
    }

    try {
      // Guardar el intento individual para análisis y depuración
      const quizAttempt = await prisma.quizAttempt.create({
        data: {
          userId,
          mainTopic,
          subTopic,
          question: question || "No disponible",
          userAnswer: userAnswer || "No disponible",
          correctAnswer: correctAnswer || "No disponible",
          isCorrect: correct,
        },
      })

      // Actualizar las estadísticas agregadas
      const result = await prisma.quizResult.upsert({
        where: {
          userId_mainTopic_subTopic: {
            userId,
            mainTopic,
            subTopic,
          },
        },
        update: {
          [correct ? "correctCount" : "incorrectCount"]: { increment: 1 },
          updatedAt: new Date(),
        },
        create: {
          userId,
          mainTopic,
          subTopic,
          correctCount: correct ? 1 : 0,
          incorrectCount: correct ? 0 : 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      console.log("Quiz result saved:", result)
      console.log("Quiz attempt details saved:", quizAttempt)

      res.status(200).json({ result, quizAttempt })
    } catch (error) {
      console.error("Error al guardar el resultado del cuestionario:", error)
      res.status(500).json({ error: "Error al guardar el resultado del cuestionario" })
    }
  } else if (req.method === "GET") {
    try {
      const results = await prisma.quizResult.findMany({
        where: { userId },
      })

      // Opcionalmente, obtener los últimos intentos para análisis
      const recentAttempts = await prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })

      res.status(200).json({ results, recentAttempts })
    } catch (error) {
      console.error("Error al obtener los resultados de los cuestionarios:", error)
      res.status(500).json({ error: "Error al obtener los resultados de los cuestionarios" })
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

