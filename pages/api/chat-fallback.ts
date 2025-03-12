import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    // Respuesta simulada para permitir que la aplicación funcione sin bcrypt
    return res.status(200).json({
      content: "El servicio de chat está temporalmente en mantenimiento. Por favor, intenta más tarde.",
    })
  } catch (error) {
    console.error("Error en la ruta de chat:", error)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

