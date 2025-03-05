"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(30)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resetToken && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      router.push("/")
    }
    return () => clearTimeout(timer)
  }, [resetToken, countdown, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResetToken("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetToken(data.resetToken)
        setCountdown(30)
      } else {
        setError(data.error || "Ocurrió un error al procesar tu solicitud")
      }
    } catch (error) {
      setError("Ocurrió un error al conectar con el servidor")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {resetToken && (
        <Alert variant="default" className="space-y-4">
          <AlertDescription>
            Se ha generado un token de restablecimiento. Por favor, usa el enlace a continuación para restablecer tu
            contraseña:
            <Link
              href={`/reset-password?token=${resetToken}`}
              className="block mt-4 text-center text-primary hover:underline"
            >
              Haz clic aquí para restablecer tu contraseña
            </Link>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Este enlace expirará en {countdown} segundos
            </p>
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={!!resetToken}>
        Solicitar restablecimiento de contraseña
      </Button>
    </form>
  )
}

