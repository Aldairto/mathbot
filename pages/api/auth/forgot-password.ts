import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 30000) // 30 segundos

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    })

    res.status(200).json({
      message: "Se ha generado un token de restablecimiento.",
      resetToken,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Error processing your request" })
  }
}

