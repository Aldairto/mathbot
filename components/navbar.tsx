'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    console.log('Cerrando sesión...')
    router.push('/')
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container flex items-center justify-between h-16">
        <Link href="/dashboard" className="text-xl font-bold">
          MathBot
        </Link>
        <div className="space-x-4">
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link href="/dashboard">Panel</Link>
          </Button>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link href="/chat">Chat</Link>
          </Button>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link href="/settings">Configuración</Link>
          </Button>
          <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  )
}

