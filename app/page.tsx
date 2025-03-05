import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "MathBot - Tu asistente de matemáticas personal",
  description: "Aprende matemáticas de forma interactiva con nuestro chatbot inteligente",
}

export default function HomePage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">MathBot</CardTitle>
          <CardDescription className="text-center">Tu asistente de matemáticas personal</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Registrarse</Link>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <Link href="/about">Acerca de MathBot</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

