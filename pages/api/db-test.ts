import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Intentar ejecutar una consulta específica de MySQL
    const result = await prisma.$queryRaw`SELECT VERSION() as version`

    // Obtener información sobre la conexión
    const connectionInfo = {
      provider: prisma._engineConfig.datamodel.includes('provider = "mysql"') ? "MySQL" : "SQLite",
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]*@/, ":****@"), // Ocultar contraseña
      result,
    }

    res.status(200).json({ success: true, connectionInfo })
  } catch (error) {
    console.error("Error al probar la conexión:", error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

