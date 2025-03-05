"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            MathBot
          </Link>
          <div className="hidden md:flex space-x-4">
            <NavLink href="/about">Acerca de</NavLink>
            {session ? (
              <>
                <NavLink href="/dashboard">Mi Avance</NavLink>
                <NavLink href="/chat">Chat</NavLink>
                <NavLink href="/quizzes">Cuestionarios</NavLink>
                <NavLink href="/settings">Configuración</NavLink>
                <Button
                  variant="outline"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <NavLink href="/login">Iniciar sesión</NavLink>
                <NavLink href="/register">Registrarse</NavLink>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink href="/about" onClick={toggleMenu}>
              Acerca de
            </NavLink>
            {session ? (
              <>
                <NavLink href="/dashboard" onClick={toggleMenu}>
                  Mi Avance
                </NavLink>
                <NavLink href="/chat" onClick={toggleMenu}>
                  Chat
                </NavLink>
                <NavLink href="/quizzes" onClick={toggleMenu}>
                  Cuestionarios
                </NavLink>
                <NavLink href="/settings" onClick={toggleMenu}>
                  Configuración
                </NavLink>
                <Button
                  variant="outline"
                  className="w-full mt-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <NavLink href="/login" onClick={toggleMenu}>
                  Iniciar sesión
                </NavLink>
                <NavLink href="/register" onClick={toggleMenu}>
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link href={href} {...props}>
      <span className="block py-2 px-3 text-primary-foreground hover:bg-primary-foreground/10 rounded-md">
        {children}
      </span>
    </Link>
  )
}

