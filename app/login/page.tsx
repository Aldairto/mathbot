import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoginFormWrapper } from "@/components/login-form-wrapper"
import { ArrowLeft, Lock, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: "Iniciar sesión - MathBot",
  description: "Inicia sesión en tu cuenta de MathBot",
}

export default function LoginPage() {
  return (
    <div className="container grid lg:grid-cols-2 gap-8 items-center justify-center min-h-screen py-12 px-4">
      {/* Columna de información */}
      <div className="hidden lg:flex flex-col space-y-6 max-w-md">
        <div>
          <h1 className="text-3xl font-bold mb-4">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground">
            Inicia sesión para continuar tu viaje de aprendizaje matemático y acceder a todas tus herramientas personalizadas.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Continúa donde lo dejaste</h3>
              <p className="text-sm text-muted-foreground">
                Retoma tu aprendizaje exactamente donde lo dejaste la última vez.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Acceso seguro</h3>
              <p className="text-sm text-muted-foreground">
                Tu información personal y progreso están protegidos con las últimas medidas de seguridad.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Experiencia personalizada</h3>
              <p className="text-sm text-muted-foreground">
                Accede a tu perfil personalizado y configuraciones adaptadas a tus necesidades.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulario de inicio de sesión */}
      <Card className="w-full max-w-md mx-auto shadow-lg border-muted/40">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormWrapper />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-sm text-center">
            ¿Olvidaste tu contraseña?{" "}
            <Link href="/forgot-password" className="text-primary hover:underline">
              Recuperar acceso
            </Link>
          </div>
          <div className="text-sm text-center">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild className="w-fit mx-auto">
            <Link href="/" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}