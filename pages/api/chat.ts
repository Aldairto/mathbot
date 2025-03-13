import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from "@/lib/prisma"
import openai from "@/lib/openai"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "No autorizado" })
    }

    const { messages, generateQuiz, mainTopic, subTopic, includeCorrectAnswer } = req.body
    const userId = session.user.id

    // Verificar si la clave API de OpenAI está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY no está configurada. Devolviendo mensaje de error.")
      return res.status(503).json({
        content:
          "El servicio de chat está temporalmente no disponible. Por favor, contacta al administrador para configurar la clave API de OpenAI.",
      })
    }

    // Manejar generación de cuestionarios
    if (generateQuiz) {
      try {
        const quizContent = await generateQuestionnaire(mainTopic, subTopic, includeCorrectAnswer)
        return res.status(200).json({ content: quizContent })
      } catch (error) {
        console.error("Error al generar cuestionario:", error)
        return res.status(500).json({
          error: "Error al generar cuestionario",
          content: "Lo siento, no se pudo generar el cuestionario. Por favor, intenta más tarde.",
        })
      }
    }

    // Validar mensajes
    if (!Array.isArray(messages)) {
      throw new Error("messages debe ser un array")
    }

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages[messages.length - 1].content

    try {
      // Llamar a la API de OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Usar un modelo más económico si gpt-4 no está disponible
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

      // Verificar respuesta
      if (!response.choices || response.choices.length === 0) {
        throw new Error("No se recibió una respuesta válida de API")
      }

      // Formatear respuesta
      const content = response.choices[0].message.content || "No se pudo generar una respuesta."

      // Guardar mensajes en la base de datos
      try {
        // Guardar mensaje del usuario
        const userMessage = await prisma.message.create({
          data: {
            content: messages[messages.length - 1].content,
            role: "user",
            userId,
          },
        })

        // Guardar mensaje del asistente
        const assistantMessage = await prisma.message.create({
          data: {
            content,
            role: "assistant",
            userId,
          },
        })

        return res.status(200).json({ content: assistantMessage.content })
      } catch (dbError) {
        console.error("Error al guardar mensajes en la base de datos:", dbError)
        // Devolver el contenido aunque haya error en la base de datos
        return res.status(200).json({ content, warning: "No se pudieron guardar los mensajes" })
      }
    } catch (apiError) {
      console.error("Error al llamar a la API de OpenAI:", apiError)
      return res.status(503).json({
        content: "Lo siento, el servicio de chat está temporalmente no disponible. Por favor, intenta más tarde.",
      })
    }
  } catch (error) {
    console.error("Error general en la API de chat:", error)
    return res.status(500).json({
      error: "Error interno del servidor",
      content: "Lo siento, ocurrió un error inesperado. Por favor, intenta más tarde.",
    })
  }
}

// Función para generar cuestionarios
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Usar un modelo más económico
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en matemáticas que genera cuestionarios educativos con fórmulas LaTeX. IMPORTANTE: Distribuye aleatoriamente las respuestas correctas entre las opciones a, b, c y d. No coloques siempre la respuesta correcta en la misma opción. SIEMPRE deja un espacio antes y después de cada expresión matemática.",
        },
        { role: "user", content: prompt },
      ],
    })

    const content = response.choices[0].message.content || "No se pudo generar el cuestionario."
    return content
  } catch (error) {
    console.error("Error al generar cuestionario:", error)
    throw new Error("No se pudo generar el cuestionario")
  }
}

