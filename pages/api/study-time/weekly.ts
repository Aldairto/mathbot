import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Calcular la fecha de inicio de la semana actual (domingo)
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Retroceder al domingo
    startOfWeek.setHours(0, 0, 0, 0)

    // Obtener todos los registros de tiempo de estudio de la semana actual
    const weeklyStudyTimes = await prisma.studyTime.findMany({
      where: {
        userId: session.user.id,
        date: {
          // Cambiado de createdAt a date
          gte: startOfWeek,
        },
      },
      select: {
        duration: true,
        date: true, // Cambiado de createdAt a date
      },
    })

    // Agrupar por día de la semana
    const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

    // Inicializar el objeto para almacenar los datos por día
    const weeklyData = daysOfWeek.map((day) => ({
      day,
      duration: 0,
    }))

    // Sumar las duraciones por día
    weeklyStudyTimes.forEach((record) => {
      const dayOfWeek = record.date.getDay() // 0 = Domingo, 1 = Lunes, etc.
      weeklyData[dayOfWeek].duration += record.duration
    })

    return res.status(200).json({
      weeklyData,
    })
  } catch (error) {
    console.error("Error fetching weekly study time:", error)
    return res.status(500).json({ message: "Error fetching weekly study time" })
  }
}

