"use client"

import dynamic from "next/dynamic"

const LoginForm = dynamic(() => import("./login-form"), { ssr: false })

export function LoginFormWrapper() {
  return <LoginForm />
}

