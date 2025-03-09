// Este es un componente de servidor (sin "use client")
import { Suspense } from "react"
import { ResetPasswordClient } from "./reset-password-client"

// Esto es crucial para evitar la generación estática de esta página
export const dynamic = "force-dynamic"
export const dynamicParams = true
export const revalidate = 0

export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <ResetPasswordClient />
      </Suspense>
    </div>
  )
}

