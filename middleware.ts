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

  // Crear encabezados personalizados para depuración
  const headers = new Headers(request.headers)
  headers.set("x-debug-has-openai-key", hasOpenAIKey.toString())
  headers.set("x-debug-environment", environment)

  // Solo redirigir al fallback si NO hay API key de OpenAI
  if (!hasOpenAIKey && request.nextUrl.pathname === "/api/chat") {
    console.log("[Middleware] Redirigiendo al fallback porque no hay API key de OpenAI")

    // Crear una respuesta con información de depuración
    const response = NextResponse.rewrite(new URL("/api/chat-fallback", request.url))
    response.headers.set("x-debug-reason", "missing-openai-key")
    return response
  }

  // En cualquier otro caso, continuar normalmente
  console.log("[Middleware] Continuando con la solicitud normal")
  const response = NextResponse.next({
    request: {
      headers,
    },
  })

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}

