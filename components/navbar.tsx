"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Info, BarChart2, MessageSquare, FileQuestion, Settings, LogOut, LogIn, UserPlus, Sun, Moon, Laptop } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  // Detectar scroll para cambiar la apariencia de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Determinar si estamos en la página de configuración
  const isSettingsPage = pathname?.startsWith('/settings')

  // Determinar clases de color basadas en el tema
  const isDarkTheme = theme === 'dark'

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-primary/95 backdrop-blur-sm shadow-md" 
          : "bg-primary",
        isDarkTheme ? "text-primary-foreground" : "text-primary-foreground"
      )}
      aria-label="Navegación principal"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <span className={cn(
              "p-1 rounded",
              isDarkTheme ? "bg-white text-primary" : "bg-white text-primary"
            )}>M</span>
            <span className="text-primary-foreground">MathBot</span>
          </Link>

          {/* Navegación de escritorio */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/about" icon={<Info className="h-4 w-4" />} isActive={pathname === '/about'}>
              Acerca de
            </NavLink>
            
            {status === "authenticated" ? (
              <>
                <NavLink href="/dashboard" icon={<BarChart2 className="h-4 w-4" />} isActive={pathname === '/dashboard'}>
                  Mi Avance
                </NavLink>
                <NavLink href="/chat" icon={<MessageSquare className="h-4 w-4" />} isActive={pathname === '/chat'}>
                  Chat
                </NavLink>
                <NavLink href="/quizzes" icon={<FileQuestion className="h-4 w-4" />} isActive={pathname === '/quizzes'}>
                  Cuestionarios
                </NavLink>
                <NavLink 
                  href="/settings" 
                  icon={<Settings className="h-4 w-4" />} 
                  isActive={isSettingsPage}
                >
                  Configuración
                </NavLink>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "ml-2 flex items-center gap-1",
                    isDarkTheme 
                      ? "bg-white text-primary hover:bg-white/90" 
                      : "bg-white text-primary hover:bg-white/90"
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </Button>
              </>
            ) : (
              <>
                <NavLink href="/login" icon={<LogIn className="h-4 w-4" />} isActive={pathname === '/login'}>
                  Iniciar sesión
                </NavLink>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "ml-2 flex items-center gap-1",
                    isDarkTheme 
                      ? "bg-white text-primary hover:bg-white/90" 
                      : "bg-white text-primary hover:bg-white/90"
                  )}
                  asChild
                >
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    <span>Registrarse</span>
                  </Link>
                </Button>
              </>
            )}

            {/* Selector de tema */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-1 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
                  {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
                  {theme === 'system' && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Oscuro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden flex items-center gap-2">
            {/* Selector de tema móvil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
                  {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
                  {theme === 'system' && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Oscuro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button 
              className="p-2 rounded-md hover:bg-primary-foreground/10 transition-colors text-primary-foreground"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil con animación */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
              className={cn(
                "px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg",
                isDarkTheme 
                  ? "bg-primary/95 backdrop-blur-sm" 
                  : "bg-primary/95 backdrop-blur-sm"
              )}
            >
              <MobileNavLink href="/about" icon={<Info />} isActive={pathname === '/about'}>
                Acerca de
              </MobileNavLink>
              
              {status === "authenticated" ? (
                <>
                  <MobileNavLink href="/dashboard" icon={<BarChart2 />} isActive={pathname === '/dashboard'}>
                    Mi Avance
                  </MobileNavLink>
                  <MobileNavLink href="/chat" icon={<MessageSquare />} isActive={pathname === '/chat'}>
                    Chat
                  </MobileNavLink>
                  <MobileNavLink href="/quizzes" icon={<FileQuestion />} isActive={pathname === '/quizzes'}>
                    Cuestionarios
                  </MobileNavLink>
                  <MobileNavLink href="/settings" icon={<Settings />} isActive={isSettingsPage}>
                    Configuración
                  </MobileNavLink>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full flex items-center justify-center gap-2",
                        isDarkTheme 
                          ? "bg-white text-primary hover:bg-white/90" 
                          : "bg-white text-primary hover:bg-white/90"
                      )}
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <MobileNavLink href="/login" icon={<LogIn />} isActive={pathname === '/login'}>
                    Iniciar sesión
                  </MobileNavLink>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full flex items-center justify-center gap-2",
                        isDarkTheme 
                          ? "bg-white text-primary hover:bg-white/90" 
                          : "bg-white text-primary hover:bg-white/90"
                      )}
                      asChild
                    >
                      <Link href="/register">
                        <UserPlus className="h-4 w-4" />
                        Registrarse
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// Componente de enlace de navegación para escritorio
function NavLink({ 
  href, 
  children, 
  icon, 
  isActive, 
  ...props 
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { 
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={cn(
        "relative flex items-center gap-1 py-2 px-3 rounded-md transition-colors text-primary-foreground",
        "hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50",
        isActive && "bg-primary-foreground/15 font-medium"
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground rounded-full" />
      )}
    </Link>
  )
}

// Componente de enlace de navegación para móvil con animación
function MobileNavLink({ 
  href, 
  children, 
  icon, 
  isActive, 
  ...props 
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { 
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Link 
        href={href} 
        className={cn(
          "flex items-center gap-3 py-3 px-4 rounded-md transition-colors text-primary-foreground",
          "hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50",
          isActive ? "bg-primary-foreground/15 font-medium" : ""
        )}
        aria-current={isActive ? "page" : undefined}
        {...props}
      >
        {icon && <span className="text-primary-foreground/80">{icon}</span>}
        <span>{children}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
        )}
      </Link>
    </motion.div>
  )
}