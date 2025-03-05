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

    switch (req.method) {
      case "GET":
        try {
          const messages = await prisma.message.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          })
          res.status(200).json(
            messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          )
        } catch (error) {
          console.error("Error al obtener los mensajes:", error)
          res.status(500).json({ error: "Error al obtener los mensajes" })
        }
        break

      case "DELETE":
        try {
          await prisma.message.deleteMany({
            where: { userId },
          })
          res.status(200).json({ message: "Mensajes eliminados" })
        } catch (error) {
          console.error("Error al eliminar los mensajes:", error)
          res.status(500).json({ error: "Error al eliminar los mensajes" })
        }
        break

      default:
        res.setHeader("Allow", ["GET", "DELETE"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error en el handler de mensajes:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

