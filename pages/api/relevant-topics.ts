import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "No autorizado" })
    }

    const userId = session.user.id

    const adaptiveCurriculum = await prisma.adaptiveCurriculum.findUnique({
      where: { userId },
      include: { topics: true },
    })

    if (!adaptiveCurriculum) {
      return res.status(404).json({ error: "Currículo adaptativo no encontrado" })
    }

    // Ordenar los temas por importancia y dificultad (de mayor a menor)
    const sortedTopics = adaptiveCurriculum.topics
      .sort((a, b) => b.importance + b.difficulty - (a.importance + a.difficulty))
      .slice(0, 5) // Tomar los 5 temas más relevantes

    const relevantTopics = sortedTopics.map((topic) => ({
      mainTopic: topic.mainTopic,
      subTopic: topic.subTopic,
      importance: topic.importance,
    }))

    res.status(200).json({ topics: relevantTopics })
  } catch (error) {
    console.error("Error al obtener los temas relevantes:", error)
    res.status(500).json({ error: "Error al obtener los temas relevantes" })
  }
}

