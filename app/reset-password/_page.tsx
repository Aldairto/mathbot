import { Suspense } from "react"
import ResetPasswordContent from "./reset-password-content"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container flex items-center justify-center min-h-screen py-8">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}