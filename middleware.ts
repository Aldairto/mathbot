import { NextResponse } from "next/server"

export function middleware(request) {
  // Solo redirigir al fallback si NO hay API key de OpenAI
  if (!process.env.OPENAI_API_KEY && request.nextUrl.pathname === "/api/chat") {
    console.log("Redirigiendo al fallback porque no hay API key de OpenAI")
    return NextResponse.rewrite(new URL("/api/chat-fallback", request.url))
  }

  // En cualquier otro caso, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}



