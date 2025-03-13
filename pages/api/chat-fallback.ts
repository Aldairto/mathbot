import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    // Mensaje claro sobre la falta de API key
    return res.status(503).json({
      content:
        "El servicio de chat no está disponible porque falta la clave de API de OpenAI. Por favor, configura OPENAI_API_KEY en las variables de entorno.",
    })
  } catch (error) {
    console.error("Error en la ruta de chat fallback:", error)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

