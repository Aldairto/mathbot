import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Intentar ejecutar una consulta simple para verificar la conexión
    const result = await prisma.$queryRaw`SELECT VERSION() as version`

    // Obtener información sobre la conexión de manera más segura
    const databaseUrl = process.env.DATABASE_URL || "No disponible"
    const maskedUrl = databaseUrl.replace(/:[^:]*@/, ":****@") // Ocultar contraseña

    // Determinar el proveedor basado en la URL de la base de datos
    let provider = "Desconocido"
    if (databaseUrl.includes("mysql")) {
      provider = "MySQL"
    } else if (databaseUrl.includes("postgresql") || databaseUrl.includes("postgres")) {
      provider = "PostgreSQL"
    } else if (databaseUrl.includes("sqlite")) {
      provider = "SQLite"
    }

    res.status(200).json({
      success: true,
      connectionInfo: {
        provider,
        databaseUrl: maskedUrl,
        result,
      },
    })
  } catch (error) {
    console.error("Error al probar la conexión:", error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

