import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, FileQuestion, BarChart2, Settings, ArrowRight, BookOpen, Brain, Target, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: "Acerca de MathBot",
  description: "Información sobre MathBot, tu asistente de matemáticas personal y cómo usarlo efectivamente",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Acerca de MathBot</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tu asistente de matemáticas personal, diseñado para transformar la forma en que aprendes y practicas matemáticas.
        </p>
      </div>

      {/* Sección de introducción */}
      <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">¿Qué es MathBot?</h2>
          <p className="mb-4 text-muted-foreground">
            MathBot es una plataforma educativa impulsada por inteligencia artificial que te ayuda a dominar las matemáticas a través de un enfoque personalizado e interactivo.
          </p>
          <p className="mb-6 text-muted-foreground">
            Diseñado tanto para estudiantes como para profesionales, MathBot se adapta a tu nivel de conocimiento y estilo de aprendizaje para ofrecerte una experiencia educativa única.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">Comenzar ahora</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#como-usar">Cómo usar MathBot</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-md h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-primary/30">MathBot</div>
              <div className="absolute w-24 h-24 bg-primary/10 rounded-full -top-4 -right-4"></div>
              <div className="absolute w-16 h-16 bg-primary/10 rounded-full bottom-8 left-8"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Características principales */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Características principales</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conversa con nuestro asistente IA para resolver dudas, recibir explicaciones detalladas y aprender nuevos conceptos matemáticos.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                Cuestionarios Adaptativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Practica con ejercicios que se adaptan a tu nivel de conocimiento, con explicaciones paso a paso y retroalimentación inmediata.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Seguimiento de Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualiza tu avance con estadísticas detalladas, identifica áreas de mejora y celebra tus logros en el camino.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cómo usar MathBot */}
      <div id="como-usar" className="mb-16 scroll-mt-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Cómo usar MathBot</h2>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              Cuestionarios
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-xl font-semibold mb-4">Usando el Chat</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">1</div>
                    <div>
                      <p className="font-medium">Accede a la sección de Chat</p>
                      <p className="text-sm text-muted-foreground">Navega a la sección "Chat" desde el menú principal.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">2</div>
                    <div>
                      <p className="font-medium">Formula tu pregunta</p>
                      <p className="text-sm text-muted-foreground">Escribe tu duda matemática en el campo de texto. Sé específico para obtener mejores respuestas.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">3</div>
                    <div>
                      <p className="font-medium">Interactúa con las respuestas</p>
                      <p className="text-sm text-muted-foreground">Haz preguntas de seguimiento para profundizar en el tema o solicitar aclaraciones adicionales.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">4</div>
                    <div>
                      <p className="font-medium">Guarda respuestas útiles</p>
                      <p className="text-sm text-muted-foreground">Marca las explicaciones más útiles para revisarlas posteriormente en tu biblioteca personal.</p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/chat" className="flex items-center gap-1">
                      Ir al Chat <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Ejemplos de preguntas efectivas:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="bg-background p-2 rounded">
                    "¿Puedes explicarme cómo resolver ecuaciones cuadráticas usando la fórmula general?"
                  </li>
                  <li className="bg-background p-2 rounded">
                    "Necesito ayuda para entender la derivada del producto de dos funciones."
                  </li>
                  <li className="bg-background p-2 rounded">
                    "¿Cuáles son las propiedades de los logaritmos y cómo se aplican?"
                  </li>
                  <li className="bg-background p-2 rounded">
                    "Explícame el teorema de Pitágoras con un ejemplo práctico."
                  </li>
                </ul>
                <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Consejo:</p>
                  <p className="text-sm text-muted-foreground">
                    Para problemas complejos, puedes subir una imagen de tu ejercicio usando el botón de adjuntar archivo.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quizzes" className="border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-xl font-semibold mb-4">Practicando con Cuestionarios</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">1</div>
                    <div>
                      <p className="font-medium">Selecciona un tema</p>
                      <p className="text-sm text-muted-foreground">Elige el área matemática que deseas practicar desde la sección de Cuestionarios.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">2</div>
                    <div>
                      <p className="font-medium">Configura tu sesión</p>
                      <p className="text-sm text-muted-foreground">Ajusta el nivel de dificultad y el número de preguntas según tus preferencias.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">3</div>
                    <div>
                      <p className="font-medium">Resuelve los ejercicios</p>
                      <p className="text-sm text-muted-foreground">Trabaja en cada problema a tu propio ritmo. Usa las pistas si necesitas ayuda.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">4</div>
                    <div>
                      <p className="font-medium">Revisa tus resultados</p>
                      <p className="text-sm text-muted-foreground">Analiza las explicaciones detalladas para entender los conceptos completamente.</p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/quizzes" className="flex items-center gap-1">
                      Ir a Cuestionarios <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Beneficios de los cuestionarios:</h4>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Aprendizaje activo:</span> Resolver problemas refuerza tu comprensión mucho mejor que solo leer teoría.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Retroalimentación inmediata:</span> Aprende de tus errores en el momento para corregir conceptos erróneos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Adaptabilidad:</span> Los ejercicios se ajustan automáticamente a tu nivel de conocimiento.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Biblioteca de conocimiento:</span> Las respuestas correctas se guardan para crear tu propia biblioteca de referencia.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Consejo:</p>
                  <p className="text-sm text-muted-foreground">
                    Programa sesiones cortas pero frecuentes para maximizar la retención y evitar la fatiga mental.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard" className="border rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-xl font-semibold mb-4">Usando el Dashboard</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">1</div>
                    <div>
                      <p className="font-medium">Accede a tu Dashboard</p>
                      <p className="text-sm text-muted-foreground">Visita la sección "Mi Avance" para ver tu progreso general.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">2</div>
                    <div>
                      <p className="font-medium">Analiza tus estadísticas</p>
                      <p className="text-sm text-muted-foreground">Revisa los gráficos de rendimiento para identificar tendencias y áreas de mejora.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">3</div>
                    <div>
                      <p className="font-medium">Consulta tu biblioteca de conocimiento</p>
                      <p className="text-sm text-muted-foreground">Accede a las respuestas correctas guardadas para repasar conceptos importantes.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">4</div>
                    <div>
                      <p className="font-medium">Establece metas de aprendizaje</p>
                      <p className="text-sm text-muted-foreground">Define objetivos específicos para mantener tu motivación y enfoque.</p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/dashboard" className="flex items-center gap-1">
                      Ir al Dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Características del Dashboard:</h4>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Gráficos de progreso:</span> Visualiza tu mejora a lo largo del tiempo en diferentes áreas matemáticas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Análisis de fortalezas y debilidades:</span> Identifica los temas que dominas y los que necesitan más práctica.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Tiempo de estudio:</span> Seguimiento del tiempo dedicado a cada tema para optimizar tus sesiones.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Recomendaciones personalizadas:</span> Sugerencias de temas a estudiar basadas en tu rendimiento actual.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">Consejo:</p>
                  <p className="text-sm text-muted-foreground">
                    Revisa tu dashboard semanalmente para ajustar tu plan de estudio y mantener un progreso constante.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preguntas frecuentes */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Necesito conocimientos previos para usar MathBot?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No, MathBot está diseñado para adaptarse a todos los niveles, desde principiantes hasta usuarios avanzados. El sistema ajustará automáticamente la dificultad según tus respuestas.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Qué temas matemáticos cubre MathBot?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                MathBot cubre una amplia gama de temas, desde aritmética básica hasta cálculo avanzado, álgebra, geometría, estadística, probabilidad y más.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Puedo usar MathBot para preparar exámenes?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ¡Absolutamente! MathBot es una excelente herramienta para preparación de exámenes. Puedes practicar con ejercicios similares a los de tu examen y recibir explicaciones detalladas.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Cómo personalizo mi experiencia de aprendizaje?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Puedes personalizar tu experiencia en la sección de Configuración, donde podrás ajustar el nivel de dificultad, temas preferidos, formato de las explicaciones y más.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Llamada a la acción */}
      <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar tu viaje matemático?</h2>
        <p className="mb-6 max-w-2xl mx-auto text-muted-foreground">
          Únete a miles de estudiantes que están transformando su forma de aprender matemáticas con MathBot.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Crear una cuenta</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}