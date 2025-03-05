import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/lib/prisma"

const FIVE_MINUTES = 5 * 60 // 5 minutos en segundos

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  if (req.method === "GET") {
    // Obtener el tiempo de estudio total
    try {
      const studyTimes = await prisma.studyTime.findMany({
        where: { userId: session.user.id },
        select: { duration: true },
      })

      // Calcular el tiempo total sumando todas las duraciones
      const totalStudyTime = studyTimes.reduce((total, record) => total + record.duration, 0)

      res.status(200).json({
        studyTime: totalStudyTime,
      })
    } catch (error) {
      console.error("Error fetching study time:", error)
      res.status(500).json({ message: "Error fetching study time" })
    }
  } else if (req.method === "POST") {
    // Registrar una nueva sesión de estudio
    const { seconds } = req.body

    if (typeof seconds !== "number" || seconds < 0) {
      return res.status(400).json({ message: "Invalid study time" })
    }

    try {
      // Crear un nuevo registro de tiempo de estudio
      await prisma.studyTime.create({
        data: {
          userId: session.user.id,
          duration: seconds,
        },
      })

      // Obtener el tiempo total actualizado
      const studyTimes = await prisma.studyTime.findMany({
        where: { userId: session.user.id },
        select: { duration: true },
      })

      const totalStudyTime = studyTimes.reduce((total, record) => total + record.duration, 0)

      res.status(200).json({
        message: "Study time updated successfully",
        studyTime: totalStudyTime,
      })
    } catch (error) {
      console.error("Error updating study time:", error)
      res.status(500).json({ message: "Error updating study time" })
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

