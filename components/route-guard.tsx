"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login") // If no authenticated session, redirect to login
  }, [session, status, router])

  if (status === "loading") {
    return <div>Cargando...</div> // You can replace this with a loading spinner or skeleton
  }

  return session ? <>{children}</> : null
}

