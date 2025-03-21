import { NextResponse } from "next/server"
import OpenAI from "openai"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth" // Importar desde la ubicación centralizada

// Añadir logs para depuración
console.log("[API] Inicializando ruta /api/chat (App Router)")
console.log("[API] ¿OpenAI API Key configurada?", !!process.env.OPENAI_API_KEY)

// Función para obtener la clave de API de OpenAI
function getOpenAIKey() {
  // Intentar obtener la clave de diferentes formas
  const key =
    process.env.OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.openai_api_key ||
    process.env.OpenAIApiKey

  if (!key) {
    console.error("[API] No se pudo encontrar la clave de API de OpenAI en ninguna variable de entorno")
  } else {
    console.log("[API] Clave de API de OpenAI encontrada con longitud:", key.length)
  }

  return key
}

// Lista de temas permitidos
const ALLOWED_TOPICS = {
  "1.1 Álgebra": [
    "Razones",
    "Proporciones",
    "Sucesiones",
    "Series",
    "Polinomios",
    "Ecuaciones lineales y ecuaciones cuadráticas",
  ],
  "1.2 Probabilidad y estadística": ["Estadística descriptiva", "Probabilidad"],
  "1.3 Geometría y trigonometría": [
    "Triángulos",
    "Polígonos",
    "Poliedros",
    "Circunferencia y círculo",
    "Triángulos rectángulos",
    "Triángulos oblicuángulos",
  ],
  "1.4 Geometría analítica": [
    "Lugar geométrico de rectas y curvas",
    "Pendiente y ángulo de inclinación",
    "Ecuación de la recta, de la circunferencia y de la parábola",
  ],
  "1.5 Funciones": ["Relaciones y funciones", "Graficación de funciones", "Función lineal", "Funciones cuadráticas"],
};

// Inicializar OpenAI con la clave API
const openai = new OpenAI({
  apiKey: getOpenAIKey(),
})

// Función para formatear respuestas LaTeX
async function formatLatexResponse(content: string): Promise<string> {
  // Asegurarse de que las expresiones LaTeX tengan los delimitadores correctos
  let formatted = content

  // Convertir \begin{align*} y \end{align*} a $$ $$
  formatted = formatted.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g, (match, p1) => {
    // Reemplazar \\ con saltos de línea dentro del bloque align*
    const alignContent = p1.replace(/\\\\/g, "\n")
    return `$$${alignContent}$$`
  })

  // Convertir $$ $$ a $ $ para fórmulas en línea
  formatted = formatted.replace(/\$\$(.*?)\$\$/g, "$$$1$$")

  // Convertir \[ \] a $$ $$ para fórmulas en bloque
  formatted = formatted.replace(/\\\[(.*?)\\\]/g, "$$$$1$$")

  // Reemplazar múltiples saltos de línea con uno doble
  formatted = formatted.replace(/\n{3,}/g, "\n\n")

  // Asegurarse de que las fórmulas en bloque estén en líneas separadas
  formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (match) => `\n\n${match}\n\n`)

  // Eliminar espacios en blanco adicionales al principio y al final
  formatted = formatted.trim()

  return formatted
}

// Manejador principal para solicitudes POST
export async function POST(req: Request) {
  // NUEVOS LOGS PARA VERIFICAR LA REGIÓN
  console.log("[API] Región de Vercel:", process.env.VERCEL_REGION)
  console.log("[API] Entorno de Vercel:", process.env.VERCEL_ENV)
  console.log("[API] Runtime de Next.js:", process.env.NEXT_RUNTIME)
  console.log(
    "[API] Variables de entorno disponibles:",
    Object.keys(process.env).filter((key) => !key.includes("KEY") && !key.includes("SECRET") && !key.includes("TOKEN")),
  )

  console.log("[API] Recibida solicitud POST a /api/chat")

  try {
    // Verificar autenticación
    console.log("[API] Verificando sesión de usuario")
    const session = await getServerSession(authOptions)
    console.log("[API] Sesión:", session ? "Encontrada" : "No encontrada")

    if (!session || !(session as any).user || !(session as any).user.id) {
      console.log("[API] Error: Usuario no autorizado")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si tenemos la API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.error("[API] Error: OPENAI_API_KEY no está configurada")
      return NextResponse.json(
        {
          error: "Configuración incompleta",
          message: "La clave de API de OpenAI no está configurada",
        },
        { status: 503 },
      )
    }

    // Analizar el cuerpo de la solicitud
    const body = await req.json()
    console.log("[API] Cuerpo de la solicitud recibido:", {
      hasMessages: !!body.messages,
      messageCount: body.messages?.length || 0,
      generateQuiz: !!body.generateQuiz,
    })

    const { messages, generateQuiz, mainTopic, subTopic, includeCorrectAnswer } = body
    const userId = (session as any)?.user?.id || "anonymous"

    // Manejar generación de cuestionarios
    if (generateQuiz) {
      console.log("[API] Generando cuestionario:", { mainTopic, subTopic })
      const quizContent = await generateQuestionnaire(mainTopic, subTopic, includeCorrectAnswer)
      console.log("[API] Cuestionario generado con éxito")
      return NextResponse.json({ content: quizContent })
    }

    // Validar mensajes - MODIFICADO PARA ACEPTAR TANTO ARRAY COMO OBJETO CON PROPIEDAD MESSAGES
    if (!messages) {
      console.log("[API] Error: messages no está definido")
      throw new Error("messages es requerido")
    }

    if (!Array.isArray(messages)) {
      console.log("[API] Error: messages no es un array")
      throw new Error("messages debe ser un array")
    }

    // Verificar que el array de mensajes no esté vacío
    if (messages.length === 0) {
      console.log("[API] Error: el array de mensajes está vacío")
      throw new Error("El array de mensajes no puede estar vacío")
    }

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages[messages.length - 1].content
    console.log("[API] Último mensaje del usuario:", lastUserMessage.substring(0, 50) + "...")

    // Crear el mensaje del sistema con las restricciones temáticas
    const systemMessage = `Eres un asistente matemático llamado MathBot especializado en matemáticas de nivel preparatoria para el examen Acredita Bach.

RESTRICCIONES IMPORTANTES:
1. SOLO debes responder preguntas relacionadas con los siguientes temas matemáticos:
   ${Object.entries(ALLOWED_TOPICS).map(([topic, subtopics]) => 
     `- ${topic}: ${subtopics.join(", ")}`
   ).join("\n   ")}

2. Si te preguntan sobre temas fuera de esta lista, responde amablemente: "Lo siento, solo puedo responder preguntas sobre temas matemáticos específicos de nivel preparatoria para el examen Acredita Bach."

3. Si te preguntan quién te creó, quién te desarrolló, o sobre tu origen, responde: "Soy MathBot, un asistente matemático. No tengo información sobre mi creación."

4. NO menciones a OpenAI, GPT, o cualquier otra tecnología de IA en tus respuestas.

5. Adapta tus explicaciones al nivel de preparatoria, como si estuvieras ayudando a un estudiante a prepararse para el examen Acredita Bach.

FORMATO MATEMÁTICO:
Cuando uses expresiones matemáticas, SIEMPRE usa los siguientes delimitadores LaTeX:
- Para fórmulas en línea: $...$ (NO uses \$$ \$$)
- Para fórmulas en bloque: $$...$$ (NO uses \\[ \\])
- Para ecuaciones alineadas: $$\\begin{align*} ... \\end{align*}$$

Es CRUCIAL que:
1. SIEMPRE uses $ $ para fórmulas en línea
2. SIEMPRE uses $$ $$ para fórmulas en bloque
3. NUNCA uses \$$ \$$ o \\[ \\]
4. SIEMPRE uses los delimitadores para CADA símbolo matemático
5. Usa asteriscos para énfasis (*cursiva* y **negrita**) en lugar de etiquetas HTML
6. SIEMPRE deja un espacio antes y después de cada expresión matemática`

    // Llamar a la API de OpenAI
    console.log("[API] Llamando a la API de OpenAI")
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: lastUserMessage,
          },
        ],
      })
      console.log("[API] Respuesta recibida de OpenAI")

      // Verificar respuesta
      if (!response.choices || response.choices.length === 0) {
        console.log("[API] Error: No se recibió una respuesta válida de OpenAI")
        throw new Error("No se recibió una respuesta válida de API")
      }

      // Formatear respuesta
      const content = await formatLatexResponse(response.choices[0].message.content || "")
      console.log("[API] Contenido formateado:", content.substring(0, 50) + "...")

      // Guardar mensajes en la base de datos
      try {
        console.log("[API] Guardando mensajes en la base de datos")
        // Guardar mensaje del usuario
        const userMessage = await prisma.message.create({
          data: {
            content: messages[messages.length - 1].content,
            role: "user",
            userId,
          },
        })

        console.log("[API] Mensaje del usuario guardado:", userMessage.id)

        // Guardar mensaje del asistente
        const assistantMessage = await prisma.message.create({
          data: {
            content,
            role: "assistant",
            userId,
          },
        })

        console.log("[API] Mensaje del asistente guardado:", assistantMessage.id)

        return NextResponse.json({ content: assistantMessage.content })
      } catch (dbError) {
        console.error("[API] Error al guardar mensajes en la base de datos:", dbError)
        return NextResponse.json({ error: "Error al guardar mensajes", details: dbError }, { status: 500 })
      }
    } catch (openaiError) {
      console.error("[API] Error completo de OpenAI:", JSON.stringify(openaiError, null, 2))

      // Verifica si es un error de API
      if (openaiError.response) {
        console.error("[API] Status:", openaiError.response.status)
        console.error("[API] Data:", openaiError.response.data)
      }

      return NextResponse.json(
        {
          error: "Error al llamar a OpenAI",
          details: openaiError.message,
          status: openaiError.response?.status || 500,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[API] Error general:", error)
    return NextResponse.json({ error: error.message || "Hubo un error al procesar tu solicitud" }, { status: 500 })
  }
}

// Modificar la función generateQuestionnaire para especificar un formato más claro
async function generateQuestionnaire(
  mainTopic: string,
  subTopic: string,
  includeCorrectAnswer = false,
): Promise<string> {
  const prompt = `
Genera un cuestionario de 5 preguntas sobre ${mainTopic} - ${subTopic}.
Cada pregunta debe tener EXACTAMENTE 4 opciones de respuesta.

FORMATO EXACTO (respeta este formato):
1. [Pregunta]
a) [Opción a]
b) [Opción b]
c) [Opción c]
d) [Opción d]
Respuesta correcta: [letra]

2. [Pregunta]
a) [Opción a]
b) [Opción b]
c) [Opción c]
d) [Opción d]
Respuesta correcta: [letra]

Y así sucesivamente...

IMPORTANTE:
- Cada pregunta DEBE tener exactamente 4 opciones, ni más ni menos.
- Las opciones DEBEN estar etiquetadas SOLO como a), b), c), d) - NO uses A), B), C), D) ni ningún otro formato.
- La respuesta correcta DEBE ser SOLO la letra (a, b, c o d).
- DISTRIBUYE ALEATORIAMENTE la respuesta correcta entre las cuatro opciones. NO coloques siempre la respuesta correcta en la opción "a".
- Para cada pregunta, elige una letra diferente como respuesta correcta si es posible.
- Asegúrate de que la letra de la respuesta correcta corresponda a una de las opciones.
- NO incluyas explicaciones adicionales, solo el formato especificado.
- Utiliza la sintaxis LaTeX con $ $ para las fórmulas matemáticas en línea y $$ $$ para las fórmulas en bloque.
- Asegúrate de que las preguntas sean variadas y cubran diferentes aspectos del subtema dentro del contexto del tema principal.
`

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Cambiado a gpt-3.5-turbo para reducir tokens
    messages: [
      {
        role: "system",
        content:
          "Eres un experto en matemáticas que genera cuestionarios educativos con fórmulas LaTeX. IMPORTANTE: Distribuye aleatoriamente las respuestas correctas entre las opciones a, b, c y d. No coloques siempre la respuesta correcta en la misma opción. SIEMPRE deja un espacio antes y después de cada expresión matemática. UTILIZA ÚNICAMENTE el formato a), b), c), d) para las opciones.",
      },
      { role: "user", content: prompt },
    ],
  })

  const content = response.choices[0].message.content || "No se pudo generar el cuestionario."

  return content
}

// Aumentar el tiempo máximo de ejecución para evitar timeouts
export const maxDuration = 60 // 60 segundos2