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
      const correctAnswers = await prisma.correctAnswer.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50, // Limitar a las últimas 50 respuestas correctas
      })

      res.status(200).json({ correctAnswers })
    } else if (req.method === "POST") {
      const { correctAnswers } = req.body

      if (!Array.isArray(correctAnswers)) {
        return res.status(400).json({ error: "correctAnswers debe ser un array" })
      }

      const savedAnswers = await prisma.correctAnswer.createMany({
        data: correctAnswers.map((answer) => ({
          ...answer,
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

