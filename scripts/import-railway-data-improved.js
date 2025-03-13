const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// URL de conexión a MySQL en Railway (reemplaza con tus datos reales)
const databaseUrl = process.env.DATABASE_URL || "mysql://usuario:contraseña@host:puerto/basededatos"

// Inicializa Prisma con la URL específica
const mysqlPrisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

// Función para sincronizar el esquema antes de importar
async function syncSchema() {
  try {
    console.log("Sincronizando esquema de Prisma con la base de datos en Railway...")

    // Crear un archivo .env temporal con la URL de la base de datos
    fs.writeFileSync(".env.railway", `DATABASE_URL="${databaseUrl}"\n`)

    // Ejecutar prisma db push para sincronizar el esquema
    console.log("Ejecutando prisma db push...")
    execSync("npx prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss", {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
    })

    console.log("Esquema sincronizado correctamente")

    // Limpiar archivo temporal
    fs.unlinkSync(".env.railway")
    return true
  } catch (error) {
    console.error("Error al sincronizar el esquema:", error)
    return false
  }
}

async function importRailwayData() {
  try {
    // Primero sincronizar el esquema
    const schemaSync = await syncSchema()
    if (!schemaSync) {
      console.error("No se pudo sincronizar el esquema. Abortando importación.")
      return
    }

    console.log("Importando datos a MySQL en Railway...")

    const dataDir = path.join(process.cwd(), "prisma/migrations/data")

    // Verificar que el directorio existe
    if (!fs.existsSync(dataDir)) {
      console.error(`El directorio de datos no existe: ${dataDir}`)
      return
    }

    // Función para cargar datos JSON de forma segura
    const loadJsonSafely = (filename) => {
      const filePath = path.join(dataDir, filename)
      if (!fs.existsSync(filePath)) {
        console.warn(`Archivo no encontrado: ${filePath}`)
        return []
      }
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"))
      } catch (error) {
        console.error(`Error al parsear ${filename}:`, error)
        return []
      }
    }

    // Cargar datos desde archivos JSON
    const users = loadJsonSafely("User.json")
    const messages = loadJsonSafely("Message.json")
    const quizResults = loadJsonSafely("QuizResult.json")
    const adaptiveCurricula = loadJsonSafely("AdaptiveCurriculum.json")
    const topics = loadJsonSafely("Topic.json")
    const correctAnswers = loadJsonSafely("CorrectAnswer.json")
    const studyTimes = loadJsonSafely("StudyTime.json")
    const userQuizStates = loadJsonSafely("UserQuizState.json")
    const quizAttempts = loadJsonSafely("QuizAttempt.json")

    // Función para procesar en lotes
    async function processBatch(items, createFn, batchSize = 5) {
      console.log(`Procesando ${items.length} elementos en lotes de ${batchSize}...`)

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        try {
          await Promise.all(batch.map((item) => createFn(item)))
          console.log(`Procesado lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(items.length / batchSize)}`)
        } catch (error) {
          console.error(`Error en lote ${Math.floor(i / batchSize) + 1}:`, error)
          // Intentar procesar uno por uno para identificar el elemento problemático
          for (const item of batch) {
            try {
              await createFn(item)
            } catch (itemError) {
              console.error(`Error al procesar elemento:`, item, itemError)
            }
          }
        }
      }
    }

    // Función para manejar explícitamente las fechas
    const createWithSafeDate = (data, dateFields) => {
      const result = { ...data }

      // Eliminar el ID para permitir que Prisma genere uno nuevo
      delete result.id

      // Convertir explícitamente los campos de fecha
      for (const field of dateFields) {
        if (result[field] !== undefined && result[field] !== null) {
          // Si es un número, convertirlo a Date
          if (typeof result[field] === "number") {
            result[field] = new Date(result[field])
          }
          // Si es una cadena que representa un número, convertirlo a número y luego a Date
          else if (typeof result[field] === "string" && !isNaN(Number(result[field]))) {
            result[field] = new Date(Number(result[field]))
          }
          // Si es una cadena de fecha ISO, convertirla directamente a Date
          else if (typeof result[field] === "string") {
            result[field] = new Date(result[field])
          }
        }
      }

      return result
    }

    // Importar usuarios
    console.log("Importando usuarios...")
    await processBatch(users, async (user) => {
      const userData = createWithSafeDate(user, ["createdAt", "updatedAt", "emailVerified", "resetTokenExpires"])
      await mysqlPrisma.user.create({ data: userData })
    })

    // Importar mensajes
    console.log("Importando mensajes...")
    await processBatch(messages, async (message) => {
      const messageData = createWithSafeDate(message, ["createdAt"])
      await mysqlPrisma.message.create({ data: messageData })
    })

    // Importar resultados de cuestionarios
    console.log("Importando resultados de cuestionarios...")
    await processBatch(quizResults, async (result) => {
      const resultData = createWithSafeDate(result, ["createdAt", "updatedAt"])
      await mysqlPrisma.quizResult.create({ data: resultData })
    })

    // Importar currículos adaptativos
    console.log("Importando currículos adaptativos...")
    await processBatch(adaptiveCurricula, async (curriculum) => {
      const curriculumData = createWithSafeDate(curriculum, ["lastUpdated"])
      await mysqlPrisma.adaptiveCurriculum.create({ data: curriculumData })
    })

    // Importar temas
    console.log("Importando temas...")
    await processBatch(topics, async (topic) => {
      const topicData = { ...topic }
      delete topicData.id
      await mysqlPrisma.topic.create({ data: topicData })
    })

    // Importar respuestas correctas
    console.log("Importando respuestas correctas...")
    await processBatch(correctAnswers, async (answer) => {
      const answerData = createWithSafeDate(answer, ["createdAt"])
      await mysqlPrisma.correctAnswer.create({ data: answerData })
    })

    // Importar tiempos de estudio
    console.log("Importando tiempos de estudio...")
    await processBatch(studyTimes, async (time) => {
      const timeData = createWithSafeDate(time, ["date"])
      await mysqlPrisma.studyTime.create({ data: timeData })
    })

    // Importar estados de cuestionarios
    console.log("Importando estados de cuestionarios...")
    await processBatch(userQuizStates, async (state) => {
      const stateData = createWithSafeDate(state, ["createdAt", "updatedAt"])
      await mysqlPrisma.userQuizState.create({ data: stateData })
    })

    // Importar intentos de cuestionarios
    console.log("Importando intentos de cuestionarios...")
    await processBatch(quizAttempts, async (attempt) => {
      const attemptData = createWithSafeDate(attempt, ["createdAt"])
      await mysqlPrisma.quizAttempt.create({ data: attemptData })
    })

    console.log("Importación completada exitosamente")
  } catch (error) {
    console.error("Error al importar datos:", error)
    console.error(error.stack)
  } finally {
    await mysqlPrisma.$disconnect()
  }
}

importRailwayData()

