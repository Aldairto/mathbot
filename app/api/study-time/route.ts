import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const studyTimes = await prisma.studyTime.findMany({
      where: { userId: session.user.id },
      select: { duration: true },
    })

    // Calcular el tiempo total sumando todas las duraciones
    const totalStudyTime = studyTimes.reduce((total, record) => total + record.duration, 0)

    return NextResponse.json({
      studyTime: totalStudyTime,
    })
  } catch (error) {
    console.error("Error fetching study time:", error)
    return NextResponse.json({ message: "Error fetching study time" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const { seconds } = await request.json()

    if (typeof seconds !== "number" || seconds < 0) {
      return NextResponse.json({ message: "Invalid study time" }, { status: 400 })
    }

    // Crear un nuevo registro de tiempo de estudio
    await prisma.studyTime.create({
      data: {
        userId: session.user.id,
        duration: seconds,
        createdAt: new Date(), // Asegurarse de que se registra la fecha actual
      },
    })

    // Obtener el tiempo total actualizado
    const studyTimes = await prisma.studyTime.findMany({
      where: { userId: session.user.id },
      select: { duration: true },
    })

    const totalStudyTime = studyTimes.reduce((total, record) => total + record.duration, 0)

    return NextResponse.json({
      message: "Study time updated successfully",
      studyTime: totalStudyTime,
    })
  } catch (error) {
    console.error("Error updating study time:", error)
    return NextResponse.json({ message: "Error updating study time" }, { status: 500 })
  }
}

