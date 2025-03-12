import { NextResponse } from "next/server"

export function middleware(request) {
  // Verificar si estamos en el entorno de compilación
  const isBuildTime = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

  // Si estamos en tiempo de compilación y la ruta es /api/chat, redirigir a la ruta alternativa
  if (isBuildTime && request.nextUrl.pathname === "/api/chat") {
    return NextResponse.rewrite(new URL("/api/chat-fallback", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}

