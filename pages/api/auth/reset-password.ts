import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: "Token y contraseña son requeridos" })
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({ error: "Token inválido o expirado" })
    }

    // Verificar si han pasado más de 30 segundos desde que se generó el token
    const tokenAge = Date.now() - user.resetTokenExpires.getTime()
    if (tokenAge > 30000) {
      // 30 segundos en milisegundos
      return res.status(400).json({ error: "El token ha expirado" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    res.status(200).json({ message: "Contraseña restablecida exitosamente" })
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error)
    res.status(500).json({ error: "Error al restablecer la contraseña" })
  }
}

