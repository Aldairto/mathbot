const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

// Asegúrate de que la variable de entorno DATABASE_URL apunte a tu base de datos MySQL en Railway
const mysqlPrisma = new PrismaClient()

async function importRailwayData() {
  try {
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

    // Función para convertir fechas de SQLite a objetos Date
    const convertDates = (obj) => {
      const result = { ...obj }
      for (const [key, value] of Object.entries(result)) {
        if (
          typeof value === "string" &&
          (key.includes("date") || key.includes("Date") || key.includes("At") || key.includes("Expires"))
        ) {
          try {
            result[key] = new Date(value)
          } catch (e) {
            console.warn(`No se pudo convertir la fecha ${key}: ${value}`)
          }
        }
      }
      return result
    }

    // Importar usuarios
    console.log("Importando usuarios...")
    await processBatch(users, async (user) => {
      const userData = convertDates(user)
      // Eliminar campos que puedan causar problemas
      delete userData.id // Permitir que Prisma genere nuevos IDs

      await mysqlPrisma.user.create({
        data: userData,
      })
    })

    // Importar mensajes
    console.log("Importando mensajes...")
    await processBatch(messages, async (message) => {
      const messageData = convertDates(message)
      delete messageData.id

      await mysqlPrisma.message.create({
        data: messageData,
      })
    })

    // Importar resultados de cuestionarios
    console.log("Importando resultados de cuestionarios...")
    await processBatch(quizResults, async (result) => {
      const resultData = convertDates(result)
      delete resultData.id

      await mysqlPrisma.quizResult.create({
        data: resultData,
      })
    })

    // Importar currículos adaptativos
    console.log("Importando currículos adaptativos...")
    await processBatch(adaptiveCurricula, async (curriculum) => {
      const curriculumData = convertDates(curriculum)
      delete curriculumData.id

      await mysqlPrisma.adaptiveCurriculum.create({
        data: curriculumData,
      })
    })

    // Importar temas
    console.log("Importando temas...")
    await processBatch(topics, async (topic) => {
      const topicData = { ...topic }
      delete topicData.id

      await mysqlPrisma.topic.create({
        data: topicData,
      })
    })

    // Importar respuestas correctas
    console.log("Importando respuestas correctas...")
    await processBatch(correctAnswers, async (answer) => {
      const answerData = convertDates(answer)
      delete answerData.id

      await mysqlPrisma.correctAnswer.create({
        data: answerData,
      })
    })

    // Importar tiempos de estudio
    console.log("Importando tiempos de estudio...")
    await processBatch(studyTimes, async (time) => {
      const timeData = convertDates(time)
      delete timeData.id

      await mysqlPrisma.studyTime.create({
        data: timeData,
      })
    })

    // Importar estados de cuestionarios
    console.log("Importando estados de cuestionarios...")
    await processBatch(userQuizStates, async (state) => {
      const stateData = convertDates(state)
      delete stateData.id

      await mysqlPrisma.userQuizState.create({
        data: stateData,
      })
    })

    // Importar intentos de cuestionarios
    console.log("Importando intentos de cuestionarios...")
    await processBatch(quizAttempts, async (attempt) => {
      const attemptData = convertDates(attempt)
      delete attemptData.id

      await mysqlPrisma.quizAttempt.create({
        data: attemptData,
      })
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

