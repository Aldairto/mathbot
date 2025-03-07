import { NextResponse } from "next/server"
import OpenAI from "openai"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

      if (!session || !(session as any).user || !(session as any).user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { messages, generateQuiz, mainTopic, subTopic, includeCorrectAnswer } = await req.json()
    const userId = (session as any)?.user?.id || 'anonymous'

    if (generateQuiz) {
      const quizContent = await generateQuestionnaire(mainTopic, subTopic, includeCorrectAnswer)
      console.log("Contenido del cuestionario generado:", quizContent)
      return NextResponse.json({ content: quizContent })
    }

    if (!Array.isArray(messages)) {
      throw new Error("messages debe ser un array")
    }

    // Solo enviar el último mensaje del usuario para evitar exceder el límite de tokens
    const lastUserMessage = messages[messages.length - 1].content

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un asistente matemático llamado MathBot. 
          Cuando uses expresiones matemáticas, SIEMPRE usa los siguientes delimitadores LaTeX:
          - Para fórmulas en línea: $...$ (NO uses \$$ \$$)
          - Para fórmulas en bloque: $$...$$ (NO uses \\[ \\])
          - Para ecuaciones alineadas: $$\\begin{align*} ... \\end{align*}$$

          Por ejemplo:
          - En línea: La variable $x$ representa la incógnita
          - En bloque: La ecuación es: 
          $$y = mx + b$$

          Es CRUCIAL que:
          1. SIEMPRE uses $ $ para fórmulas en línea
          2. SIEMPRE uses $$ $$ para fórmulas en bloque
          3. NUNCA uses \$$ \$$ o \\[ \\]
          4. SIEMPRE uses los delimitadores para CADA símbolo matemático
          5. Usa asteriscos para énfasis (*cursiva* y **negrita**) en lugar de etiquetas HTML
          6. SIEMPRE deja un espacio antes y después de cada expresión matemática`,
        },
        {
          role: "user",
          content: lastUserMessage,
        },
      ],
    })

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No se recibió una respuesta válida de API")
    }

    const content = await formatLatexResponse(response.choices[0].message.content || "")
    console.log("Contenido formateado:", content)

    // Guardar el mensaje del usuario y la respuesta del asistente en la base de datos
    try {
      const userMessage = await prisma.message.create({
        data: {
          content: messages[messages.length - 1].content,
          role: "user",
          userId,
        },
      })

      console.log("Mensaje del usuario guardado:", userMessage)

      const assistantMessage = await prisma.message.create({
        data: {
          content,
          role: "assistant",
          userId,
        },
      })

      console.log("Mensaje del asistente guardado:", assistantMessage)

      return NextResponse.json({ content: assistantMessage.content })
    } catch (dbError) {
      console.error("Error al guardar mensajes en la base de datos:", dbError)
      return NextResponse.json({ error: "Error al guardar mensajes", details: dbError }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message || "Hubo un error al procesar tu solicitud" }, { status: 500 })
  }
}

async function generateQuestionnaire(
  mainTopic: string,
  subTopic: string,
  includeCorrectAnswer = false,
): Promise<string> {
  const prompt = `
Genera un cuestionario de 5 preguntas sobre ${mainTopic} - ${subTopic}.
Cada pregunta debe tener EXACTAMENTE 4 opciones de respuesta (a, b, c, d).

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
          "Eres un experto en matemáticas que genera cuestionarios educativos con fórmulas LaTeX. IMPORTANTE: Distribuye aleatoriamente las respuestas correctas entre las opciones a, b, c y d. No coloques siempre la respuesta correcta en la misma opción. SIEMPRE deja un espacio antes y después de cada expresión matemática.",
      },
      { role: "user", content: prompt },
    ],
  })

  let content = response.choices[0].message.content || "No se pudo generar el cuestionario."



  return content
}
