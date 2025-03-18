import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RegisterFormWrapper } from "@/components/register-form-wrapper"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Brain, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: "Registro - MathBot",
  description: "Crea una cuenta en MathBot para comenzar tu viaje de aprendizaje matemático",
}

export default function RegisterPage() {
  return (
    <div className="container grid lg:grid-cols-2 gap-8 items-center justify-center min-h-screen py-12 px-4">
      {/* Columna de información */}
      <div className="hidden lg:flex flex-col space-y-6 max-w-md">
        <div>
          <h1 className="text-3xl font-bold mb-4">Únete a MathBot</h1>
          <p className="text-muted-foreground">
            Crea una cuenta y comienza tu viaje de aprendizaje matemático personalizado.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Aprendizaje personalizado</h3>
              <p className="text-sm text-muted-foreground">
                Nuestro sistema se adapta a tu nivel y estilo de aprendizaje.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Seguimiento de progreso</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza tu avance y mejora continua en cada tema.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Contenido interactivo</h3>
              <p className="text-sm text-muted-foreground">
                Aprende con ejercicios prácticos y explicaciones claras.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm italic">
            "MathBot ha transformado mi forma de estudiar matemáticas. Ahora entiendo conceptos que antes me parecían imposibles."
          </p>
          <p className="text-sm font-medium mt-2">— María G., estudiante</p>
        </div>
      </div>
      
      {/* Formulario de registro */}
      <Card className="w-full max-w-md mx-auto shadow-lg border-muted/40">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para registrarte en MathBot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterFormWrapper />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-sm text-center text-muted-foreground">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Términos de servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Política de privacidad
            </Link>
            .
          </div>
          <div className="text-sm text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
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