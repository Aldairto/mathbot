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

    if (!prisma) {
      throw new Error("Prisma client is not initialized")
    }

    if (req.method === "GET") {
      let curriculum = await prisma.adaptiveCurriculum.findUnique({
        where: { userId },
        include: { topics: true },
      })

      if (!curriculum) {
        curriculum = await prisma.adaptiveCurriculum.create({
          data: {
            userId,
            topics: {
              create: [
                { mainTopic: "Álgebra", subTopic: "Ecuaciones lineales" },
                { mainTopic: "Geometría", subTopic: "Triángulos" },
              ],
            },
          },
          include: { topics: true },
        })
      }

      res.status(200).json(curriculum)
    } else if (req.method === "PUT") {
      const { quizResults } = req.body

      if (!Array.isArray(quizResults)) {
        return res.status(400).json({ error: "quizResults debe ser un array" })
      }

      let curriculum = await prisma.adaptiveCurriculum.findUnique({
        where: { userId },
      })

      if (!curriculum) {
        curriculum = await prisma.adaptiveCurriculum.create({
          data: { userId },
        })
      }

      for (const result of quizResults) {
        const { mainTopic, subTopic, correctCount, incorrectCount } = result
        const totalQuestions = correctCount + incorrectCount
        const successRate = totalQuestions > 0 ? correctCount / totalQuestions : 0.5

        await prisma.topic.upsert({
          where: {
            curriculumId_mainTopic_subTopic: {
              curriculumId: curriculum.id,
              mainTopic,
              subTopic,
            },
          },
          update: {
            difficulty: 1 - successRate,
            importance: 1 - successRate,
          },
          create: {
            mainTopic,
            subTopic,
            difficulty: 1 - successRate,
            importance: 1 - successRate,
            curriculumId: curriculum.id,
          },
        })
      }

      const updatedCurriculum = await prisma.adaptiveCurriculum.findUnique({
        where: { userId },
        include: { topics: true },
      })

      res.status(200).json(updatedCurriculum)
    } else {
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error in adaptive curriculum handler:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

