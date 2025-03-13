import OpenAI from "openai"

// Verificar si existe la API key
const apiKey = process.env.OPENAI_API_KEY

// Crear una instancia de OpenAI con manejo de errores
const createOpenAIClient = () => {
  if (!apiKey) {
    console.warn(
      "OPENAI_API_KEY no está configurada en las variables de entorno. La funcionalidad de OpenAI estará limitada.",
    )

    // Devolver un cliente simulado para evitar errores
    return {
      chat: {
        completions: {
          create: async () => ({
            choices: [
              {
                message: {
                  content:
                    "Lo siento, el servicio de chat no está disponible en este momento porque la clave API de OpenAI no está configurada. Por favor, contacta al administrador del sistema.",
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI
  }

  // Crear un cliente real de OpenAI
  try {
    return new OpenAI({ apiKey })
  } catch (error) {
    console.error("Error al crear el cliente de OpenAI:", error)

    // Devolver un cliente simulado en caso de error
    return {
      chat: {
        completions: {
          create: async () => ({
            choices: [
              {
                message: {
                  content:
                    "Lo siento, ocurrió un error al inicializar el servicio de chat. Por favor, intenta más tarde.",
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI
  }
}

const openai = createOpenAIClient()

export default openai

