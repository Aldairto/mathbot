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
      const updatedQuizState = await prisma.userQuizState.upsert({
        where: { userId },
        update: { state: JSON.stringify(state) },
        create: { userId, state: JSON.stringify(state) },
      })
      res.status(200).json(updatedQuizState)
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

