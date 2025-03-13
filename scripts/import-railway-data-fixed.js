const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")
const { syncRailwaySchema } = require("./manual-migration")

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

async function importRailwayData() {
  try {
    // Primero sincronizar el esquema
    const schemaSync = await syncRailwaySchema()
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

    console.log("Importación completada exitosamente")
  } catch (error) {
    console.error("Error al importar datos:", error)
    console.error(error.stack)
  } finally {
    await mysqlPrisma.$disconnect()
  }
}

importRailwayData()

