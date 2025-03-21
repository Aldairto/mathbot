"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Clock, FileText, BarChart2, MessageSquare, Download, CheckCircle, Brain, LogIn } from 'lucide-react'
import { useSession } from "next-auth/react"

export default function AboutPage() {
  // Obtener el estado de la sesión
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Acerca de MathBot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>¿Qué es MathBot?</CardTitle>
            <CardDescription>Tu asistente matemático para el examen Acredita Bach</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              MathBot es un asistente matemático especializado diseñado específicamente para ayudar a estudiantes 
              de nivel preparatoria a prepararse para el examen Acredita Bach. Proporciona explicaciones claras, 
              resuelve problemas y genera cuestionarios de práctica en temas matemáticos clave.
            </p>
            <p>
              A diferencia de otros asistentes generales, MathBot se enfoca exclusivamente en matemáticas de 
              nivel preparatoria, asegurando que las explicaciones sean precisas, relevantes y adaptadas al 
              nivel educativo adecuado.
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              {isAuthenticated ? (
                // Mostrar botones de navegación solo si el usuario está autenticado
                <>
                  <Link href="/chat">
                    <Button className="flex items-center gap-2">
                      <MessageSquare size={18} />
                      Iniciar chat
                    </Button>
                  </Link>
                  <Link href="/quizzes">
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText size={18} />
                      Generar cuestionario
                    </Button>
                  </Link>
                </>
              ) : (
                // Mostrar botón de inicio de sesión si el usuario no está autenticado
                <Link href="/login">
                  <Button className="flex items-center gap-2">
                    <LogIn size={18} />
                    Iniciar sesión para acceder
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Capacidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Responde preguntas matemáticas con notación LaTeX</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Genera cuestionarios personalizados por tema</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Proporciona explicaciones detalladas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Guarda tu historial de respuestas correctas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Realiza seguimiento de tu tiempo de estudio</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Genera PDFs con tu historial de aprendizaje</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Temas cubiertos</p>
                <p className="text-2xl font-bold">5 principales + 20 subtemas</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formato matemático</p>
                <p className="text-2xl font-bold">LaTeX completo</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nivel educativo</p>
                <p className="text-2xl font-bold">Preparatoria / Acredita Bach</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Inteligencia Artificial Educativa</CardTitle>
          <CardDescription>Cómo la IA generativa potencia el aprendizaje matemático</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            MathBot aprovecha la potencia de la <strong>inteligencia artificial generativa</strong> y <strong>sistemas inteligentes</strong> 
            especializados en educación matemática. Estas tecnologías avanzadas permiten crear una experiencia de aprendizaje 
            personalizada, adaptativa y altamente efectiva para la preparación del examen Acredita Bach.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="border rounded-lg p-4 bg-secondary/10">
              <h3 className="text-lg font-semibold mb-2">IA Generativa Matemática</h3>
              <p>
                Utilizamos inteligencia artificial generativa especializada en matemáticas para crear 
                explicaciones detalladas, ejemplos personalizados y cuestionarios adaptados al nivel 
                educativo de preparatoria, con notación matemática precisa en formato LaTeX.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 bg-secondary/10">
              <h3 className="text-lg font-semibold mb-2">Sistemas Inteligentes de Aprendizaje</h3>
              <p>
                Nuestros sistemas inteligentes analizan patrones de aprendizaje para identificar 
                áreas de mejora y proporcionar retroalimentación personalizada, optimizando el 
                proceso de preparación para el examen.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 bg-secondary/10">
              <h3 className="text-lg font-semibold mb-2">Procesamiento de Lenguaje Matemático</h3>
              <p>
                MathBot comprende consultas matemáticas complejas gracias a algoritmos avanzados 
                de procesamiento de lenguaje natural especializados en terminología y conceptos 
                matemáticos de nivel preparatoria.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 bg-secondary/10">
              <h3 className="text-lg font-semibold mb-2">IA Especializada por Tema</h3>
              <p>
                Hemos entrenado nuestros modelos de IA para especializarse en los temas específicos 
                del examen Acredita Bach, asegurando respuestas precisas y relevantes en álgebra, 
                geometría, trigonometría, probabilidad y funciones.
              </p>
            </div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg mt-6">
            <h3 className="font-semibold mb-2">Innovación con propósito educativo</h3>
            <p>
              La inteligencia artificial generativa que impulsa MathBot ha sido desarrollada con un 
              enfoque puramente educativo. Nuestros sistemas inteligentes están diseñados para 
              complementar la enseñanza tradicional, proporcionando una herramienta adicional 
              que ayuda a los estudiantes a dominar conceptos matemáticos fundamentales para 
              su éxito académico.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Temas cubiertos</CardTitle>
          <CardDescription>Áreas matemáticas específicas para el examen Acredita Bach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1.1 Álgebra</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Razones</li>
                <li>Proporciones</li>
                <li>Sucesiones</li>
                <li>Series</li>
                <li>Polinomios</li>
                <li>Ecuaciones lineales y ecuaciones cuadráticas</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">1.2 Probabilidad y estadística</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Estadística descriptiva</li>
                <li>Probabilidad</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">1.3 Geometría y trigonometría</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Triángulos</li>
                <li>Polígonos</li>
                <li>Poliedros</li>
                <li>Circunferencia y círculo</li>
                <li>Triángulos rectángulos</li>
                <li>Triángulos oblicuángulos</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">1.4 Geometría analítica</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Lugar geométrico de rectas y curvas</li>
                <li>Pendiente y ángulo de inclinación</li>
                <li>Ecuación de la recta, de la circunferencia y de la parábola</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">1.5 Funciones</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Relaciones y funciones</li>
                <li>Graficación de funciones</li>
                <li>Función lineal</li>
                <li>Funciones cuadráticas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat Matemático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Interactúa con MathBot para resolver dudas matemáticas específicas. Recibe explicaciones claras con notación matemática adecuada.
            </p>
            {isAuthenticated ? (
              <Link href="/chat">
                <Button variant="secondary" size="sm" className="w-full">Ir al chat</Button>
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground italic">Inicia sesión para acceder al chat</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Cuestionarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Genera cuestionarios personalizados por tema para practicar y evaluar tu conocimiento. Recibe retroalimentación inmediata.
            </p>
            {isAuthenticated ? (
              <Link href="/quizzes">
                <Button variant="secondary" size="sm" className="w-full">Crear cuestionario</Button>
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground italic">Inicia sesión para crear cuestionarios</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Historial de Aprendizaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Revisa tu historial de respuestas correctas y descarga un PDF con explicaciones detalladas para repasar.
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="secondary" size="sm" className="w-full">Ver historial</Button>
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground italic">Inicia sesión para ver tu historial</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cómo usar MathBot</CardTitle>
          <CardDescription>Guía rápida para aprovechar al máximo tu asistente</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Haz preguntas específicas sobre matemáticas</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Ejemplo: "¿Cómo resuelvo una ecuación cuadrática por factorización?"
              </p>
            </li>
            
            <li>
              <strong>Genera cuestionarios para practicar</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Usa la sección de cuestionarios para crear pruebas personalizadas sobre temas específicos.
              </p>
            </li>
            
            <li>
              <strong>Revisa tu historial de respuestas correctas</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Consulta las respuestas que has acertado para reforzar tu aprendizaje.
              </p>
            </li>
            
            <li>
              <strong>Monitorea tu tiempo de estudio</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Utiliza el seguimiento de tiempo para mantener un ritmo constante de preparación.
              </p>
            </li>
            
            <li>
              <strong>Descarga recursos para estudio offline</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Genera PDFs con tu historial de respuestas correctas para estudiar sin conexión.
              </p>
            </li>
          </ol>
          
          <Separator className="my-6" />
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Nota importante</h3>
            <p>
              MathBot está diseñado exclusivamente para ayudar con temas matemáticos de nivel preparatoria 
              relacionados con el examen Acredita Bach. No responderá preguntas sobre otros temas o materias.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="flex items-center gap-2">
                  <BarChart2 size={18} />
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="flex items-center gap-2">
                  <LogIn size={18} />
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}