import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterFormWrapper } from "@/components/register-form-wrapper"

export const metadata: Metadata = {
  title: "Registro - MathBot",
  description: "Crea una cuenta en MathBot para comenzar tu viaje de aprendizaje matemático",
}

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para registrarte en MathBot</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterFormWrapper />
        </CardContent>
      </Card>
    </div>
  )
}

