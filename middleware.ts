import { NextResponse } from "next/server"

export function middleware(request) {
  // Obtener información sobre las variables de entorno
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  const openAIKeyLength = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
  const environment = process.env.NODE_ENV || "unknown"

  // Registrar información para depuración
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}`)
  console.log(`[Middleware] Has OpenAI Key: ${hasOpenAIKey}`)
  console.log(`[Middleware] Key Length: ${openAIKeyLength}`)
  console.log(`[Middleware] Environment: ${environment}`)

  // Solo redirigir al fallback si NO hay API key de OpenAI
  if (!hasOpenAIKey) {
    // Determinar la ruta de fallback basada en la ruta original
    let fallbackPath = null

    if (request.nextUrl.pathname === "/api/messages") {
      fallbackPath = "/api/messages-fallback"
    } else if (request.nextUrl.pathname === "/api/chat") {
      fallbackPath = "/api/chat-fallback"
    }

    if (fallbackPath) {
      console.log(`[Middleware] Redirigiendo a ${fallbackPath} porque no hay API key de OpenAI`)

      // Crear una respuesta con información de depuración
      const response = NextResponse.rewrite(new URL(fallbackPath, request.url))
      response.headers.set("x-debug-reason", "missing-openai-key")
      return response
    }
  }

  // En cualquier otro caso, continuar normalmente
  console.log("[Middleware] Continuando con la solicitud normal")
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}

