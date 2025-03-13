const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// URL de conexión a MySQL en Railway (reemplaza con tus datos reales)
const databaseUrl = process.env.DATABASE_URL || "mysql://usuario:contraseña@host:puerto/basededatos"

// Crear esquema temporal mejorado
function createImprovedSchema() {
  try {
    console.log("Creando esquema temporal para Railway con tipos de columna mejorados...")

    // Leer el esquema original
    const originalSchemaPath = path.join(process.cwd(), "prisma/schema.prisma")
    const originalSchema = fs.readFileSync(originalSchemaPath, "utf8")

    // Modificar el esquema para usar MySQL con tipos de columna adecuados
    let railwaySchema = originalSchema
      .replace(/provider\s*=\s*"sqlite"/, 'provider = "mysql"')
      .replace(/url\s*=\s*env$$"DATABASE_URL"$$/, `url = "${databaseUrl}"\n  relationMode = "prisma"`)

    // Asegurarse de que la columna content sea LONGTEXT
    railwaySchema = railwaySchema.replace(/content\s+String(\s+@db\.Text)?/g, "content String @db.LongText")

    // Guardar el esquema temporal
    const railwaySchemaPath = path.join(process.cwd(), "prisma/schema.railway.prisma")
    fs.writeFileSync(railwaySchemaPath, railwaySchema)

    console.log(`Esquema temporal creado en ${railwaySchemaPath}`)
    return railwaySchemaPath
  } catch (error) {
    console.error("Error al crear el esquema temporal:", error)
    return null
  }
}

// Sincronizar esquema con la base de datos
async function syncSchema(schemaPath) {
  try {
    console.log("Sincronizando esquema con la base de datos en Railway...")

    // Ejecutar prisma db push con el esquema temporal
    execSync(`npx prisma db push --schema=${schemaPath} --skip-generate --accept-data-loss`, {
      stdio: "inherit",
    })

    console.log("Esquema sincronizado correctamente")
    return true
  } catch (error) {
    console.error("Error al sincronizar el esquema:", error)
    return false
  }
}

// Inicializa Prisma con la URL específica
const mysqlPrisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

// Función para cargar datos JSON de forma segura
function loadJsonSafely(dataDir, filename) {
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

// Función para manejar explícitamente las fechas
function createWithSafeDate(data, dateFields) {
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
        try {
          result[field] = new Date(result[field])
        } catch (e) {
          console.warn(`No se pudo convertir la fecha ${field}: ${result[field]}`, e)
          // Usar la fecha actual como fallback
          result[field] = new Date()
        }
      }
    }
  }

  return result
}

// Función para procesar en lotes
async function processBatch(items, createFn, batchSize = 5) {
  console.log(`Procesando ${items.length} elementos en lotes de ${batchSize}...`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const results = await Promise.allSettled(batch.map((item) => createFn(item)))

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successCount++
      } else {
        errorCount++
        console.error(`Error al procesar elemento:`, batch[index], result.reason)
      }
    })

    console.log(`Procesado lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(items.length / batchSize)}`)
    console.log(`Progreso: ${successCount} éxitos, ${errorCount} errores`)
  }

  return { successCount, errorCount }
}

// Función principal para importar datos
async function importDataInOrder() {
  try {
    // Crear y sincronizar esquema mejorado
    const schemaPath = createImprovedSchema()
    if (!schemaPath) {
      console.error("No se pudo crear el esquema mejorado. Abortando importación.")
      return
    }

    const schemaSync = await syncSchema(schemaPath)
    if (!schemaSync) {
      console.error("No se pudo sincronizar el esquema. Abortando importación.")
      return
    }

    console.log("Importando datos a MySQL en Railway en orden correcto...")

    const dataDir = path.join(process.cwd(), "prisma/migrations/data")

    // Verificar que el directorio existe
    if (!fs.existsSync(dataDir)) {
      console.error(`El directorio de datos no existe: ${dataDir}`)
      return
    }

    // Cargar datos desde archivos JSON
    console.log("Cargando datos desde archivos JSON...")

    // 1. Primero importar usuarios
    const users = loadJsonSafely(dataDir, "User.json")
    console.log(`Cargados ${users.length} usuarios`)

    console.log("Importando usuarios...")
    const userResults = await processBatch(
      users,
      async (user) => {
        const userData = createWithSafeDate(user, ["createdAt", "updatedAt", "emailVerified", "resetTokenExpires"])
        return await mysqlPrisma.user.create({ data: userData })
      },
      3,
    )

    console.log(
      `Importación de usuarios completada: ${userResults.successCount} éxitos, ${userResults.errorCount} errores`,
    )

    // 2. Luego importar currículos adaptativos
    const adaptiveCurricula = loadJsonSafely(dataDir, "AdaptiveCurriculum.json")
    console.log(`Cargados ${adaptiveCurricula.length} currículos adaptativos`)

    console.log("Importando currículos adaptativos...")
    const curriculumResults = await processBatch(
      adaptiveCurricula,
      async (curriculum) => {
        const curriculumData = createWithSafeDate(curriculum, ["lastUpdated"])
        return await mysqlPrisma.adaptiveCurriculum.create({ data: curriculumData })
      },
      3,
    )

    console.log(
      `Importación de currículos completada: ${curriculumResults.successCount} éxitos, ${curriculumResults.errorCount} errores`,
    )

    // 3. Luego importar temas
    const topics = loadJsonSafely(dataDir, "Topic.json")
    console.log(`Cargados ${topics.length} temas`)

    console.log("Importando temas...")
    const topicResults = await processBatch(
      topics,
      async (topic) => {
        const topicData = { ...topic }
        delete topicData.id
        return await mysqlPrisma.topic.create({ data: topicData })
      },
      3,
    )

    console.log(
      `Importación de temas completada: ${topicResults.successCount} éxitos, ${topicResults.errorCount} errores`,
    )

    // 4. Luego importar mensajes
    const messages = loadJsonSafely(dataDir, "Message.json")
    console.log(`Cargados ${messages.length} mensajes`)

    console.log("Importando mensajes...")
    const messageResults = await processBatch(
      messages,
      async (message) => {
        const messageData = createWithSafeDate(message, ["createdAt"])
        return await mysqlPrisma.message.create({ data: messageData })
      },
      3,
    )

    console.log(
      `Importación de mensajes completada: ${messageResults.successCount} éxitos, ${messageResults.errorCount} errores`,
    )

    // 5. Importar resultados de cuestionarios
    const quizResults = loadJsonSafely(dataDir, "QuizResult.json")
    console.log(`Cargados ${quizResults.length} resultados de cuestionarios`)

    console.log("Importando resultados de cuestionarios...")
    const quizResultResults = await processBatch(
      quizResults,
      async (result) => {
        const resultData = createWithSafeDate(result, ["createdAt", "updatedAt"])
        return await mysqlPrisma.quizResult.create({ data: resultData })
      },
      3,
    )

    console.log(
      `Importación de resultados de cuestionarios completada: ${quizResultResults.successCount} éxitos, ${quizResultResults.errorCount} errores`,
    )

    // 6. Importar respuestas correctas
    const correctAnswers = loadJsonSafely(dataDir, "CorrectAnswer.json")
    console.log(`Cargados ${correctAnswers.length} respuestas correctas`)

    console.log("Importando respuestas correctas...")
    const correctAnswerResults = await processBatch(
      correctAnswers,
      async (answer) => {
        const answerData = createWithSafeDate(answer, ["createdAt"])
        return await mysqlPrisma.correctAnswer.create({ data: answerData })
      },
      3,
    )

    console.log(
      `Importación de respuestas correctas completada: ${correctAnswerResults.successCount} éxitos, ${correctAnswerResults.errorCount} errores`,
    )

    // 7. Importar tiempos de estudio
    const studyTimes = loadJsonSafely(dataDir, "StudyTime.json")
    console.log(`Cargados ${studyTimes.length} tiempos de estudio`)

    console.log("Importando tiempos de estudio...")
    const studyTimeResults = await processBatch(
      studyTimes,
      async (time) => {
        const timeData = createWithSafeDate(time, ["date"])
        return await mysqlPrisma.studyTime.create({ data: timeData })
      },
      3,
    )

    console.log(
      `Importación de tiempos de estudio completada: ${studyTimeResults.successCount} éxitos, ${studyTimeResults.errorCount} errores`,
    )

    // 8. Importar estados de cuestionarios
    const userQuizStates = loadJsonSafely(dataDir, "UserQuizState.json")
    console.log(`Cargados ${userQuizStates.length} estados de cuestionarios`)

    console.log("Importando estados de cuestionarios...")
    const quizStateResults = await processBatch(
      userQuizStates,
      async (state) => {
        const stateData = createWithSafeDate(state, ["createdAt", "updatedAt"])
        return await mysqlPrisma.userQuizState.create({ data: stateData })
      },
      3,
    )

    console.log(
      `Importación de estados de cuestionarios completada: ${quizStateResults.successCount} éxitos, ${quizStateResults.errorCount} errores`,
    )

    // 9. Importar intentos de cuestionarios
    const quizAttempts = loadJsonSafely(dataDir, "QuizAttempt.json")
    console.log(`Cargados ${quizAttempts.length} intentos de cuestionarios`)

    console.log("Importando intentos de cuestionarios...")
    const quizAttemptResults = await processBatch(
      quizAttempts,
      async (attempt) => {
        const attemptData = createWithSafeDate(attempt, ["createdAt"])
        return await mysqlPrisma.quizAttempt.create({ data: attemptData })
      },
      3,
    )

    console.log(
      `Importación de intentos de cuestionarios completada: ${quizAttemptResults.successCount} éxitos, ${quizAttemptResults.errorCount} errores`,
    )

    console.log("Importación completada exitosamente")
  } catch (error) {
    console.error("Error al importar datos:", error)
    console.error(error.stack)
  } finally {
    await mysqlPrisma.$disconnect()
  }
}

// Ejecutar la función principal
importDataInOrder()

