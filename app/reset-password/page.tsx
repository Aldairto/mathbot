"use client"

import { useSearchParams } from "next/navigation"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")

  if (!token) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
            <CardDescription className="text-center">
              No se proporcionó un token de restablecimiento válido.
              <br />
              <Link href="/forgot-password" className="text-primary hover:underline">
                Volver a solicitar restablecimiento de contraseña
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">Ingresa tu nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  )
}

