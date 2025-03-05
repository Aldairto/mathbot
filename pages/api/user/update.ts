import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "No autorizado" })
    }

    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: "El nombre es requerido" })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    res.status(200).json({ message: "Nombre de usuario actualizado con éxito", user: updatedUser })
  } catch (error) {
    console.error("Error al actualizar el nombre de usuario:", error)
    res.status(500).json({ error: "Error al actualizar el nombre de usuario" })
  }
}

