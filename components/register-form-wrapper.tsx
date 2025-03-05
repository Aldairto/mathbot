"use client"

import dynamic from "next/dynamic"

const RegisterForm = dynamic(() => import("./register-form"), { ssr: false })

export function RegisterFormWrapper() {
  return <RegisterForm />
}

