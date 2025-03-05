import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginFormWrapper } from "@/components/login-form-wrapper"

export const metadata: Metadata = {
  title: "Iniciar sesión - MathBot",
  description: "Inicia sesión en tu cuenta de MathBot",
}

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormWrapper />
        </CardContent>
      </Card>
    </div>
  )
}

