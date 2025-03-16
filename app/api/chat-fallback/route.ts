import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log("[API] Fallback de chat activado")

  // Añadir encabezados de depuración
  const headers = new Headers()
  headers.set("x-debug-has-openai-key", String(!!process.env.OPENAI_API_KEY))
  headers.set("x-debug-environment", process.env.NODE_ENV || "unknown")
  headers.set("x-debug-is-fallback", "true")

  try {
    // Proporcionar información detallada sobre por qué estamos en el fallback
    return NextResponse.json(
      {
        content: "El servicio de chat no está disponible porque falta la clave de API de OpenAI.",
        error: "Configuración incompleta",
        debug: {
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
          environment: process.env.NODE_ENV,
          availableEnvVars: Object.keys(process.env).filter(
            (key) => !key.includes("KEY") && !key.includes("SECRET") && !key.includes("TOKEN"),
          ),
        },
      },
      { status: 503, headers },
    )
  } catch (error) {
    console.error("[API] Error en la ruta de chat fallback:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers })
  }
}

