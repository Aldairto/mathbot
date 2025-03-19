import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
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
        createdAt: {
          gte: startOfWeek,
        },
      },
      select: {
        duration: true,
        createdAt: true,
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
      const dayOfWeek = record.createdAt.getDay() // 0 = Domingo, 1 = Lunes, etc.
      weeklyData[dayOfWeek].duration += record.duration
    })

    return NextResponse.json({
      weeklyData,
    })
  } catch (error) {
    console.error("Error fetching weekly study time:", error)
    return NextResponse.json({ message: "Error fetching weekly study time" }, { status: 500 })
  }
}

