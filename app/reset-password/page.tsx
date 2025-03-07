"use client"

import { Suspense } from "react"
import ResetPasswordForm from "./reset-password-form.tsx"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:px-20">
        <h1 className="text-3xl font-bold">Restablecer Contraseña</h1>
        <div className="w-full max-w-md">
          <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

