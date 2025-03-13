const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

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

async function importUsersOnly() {
  try {
    console.log("Importando solo usuarios a MySQL en Railway...")

    const dataDir = path.join(process.cwd(), "prisma/migrations/data")
    const usersFilePath = path.join(dataDir, "User.json")

    if (!fs.existsSync(usersFilePath)) {
      console.error(`Archivo de usuarios no encontrado: ${usersFilePath}`)
      return
    }

    // Cargar usuarios
    let users = []
    try {
      users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"))
      console.log(`Cargados ${users.length} usuarios del archivo JSON`)
    } catch (error) {
      console.error(`Error al parsear el archivo de usuarios:`, error)
      return
    }

    // Función para procesar usuarios en lotes
    async function processUsersBatch(users, batchSize = 3) {
      console.log(`Procesando ${users.length} usuarios en lotes de ${batchSize}...`)

      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        const results = await Promise.allSettled(
          batch.map(async (user) => {
            // Crear un nuevo objeto con las propiedades necesarias
            const userData = {
              name: user.name,
              email: user.email,
              password: user.password,
              image: user.image,
              // Convertir explícitamente los campos de fecha
              createdAt: user.createdAt
                ? new Date(Number(user.createdAt) || Date.parse(user.createdAt) || Date.now())
                : new Date(),
              updatedAt: user.updatedAt
                ? new Date(Number(user.updatedAt) || Date.parse(user.updatedAt) || Date.now())
                : new Date(),
              emailVerified: user.emailVerified
                ? new Date(Number(user.emailVerified) || Date.parse(user.emailVerified) || null)
                : null,
              resetToken: user.resetToken,
              resetTokenExpires: user.resetTokenExpires
                ? new Date(Number(user.resetTokenExpires) || Date.parse(user.resetTokenExpires) || null)
                : null,
            }

            try {
              const createdUser = await mysqlPrisma.user.create({
                data: userData,
              })
              console.log(`Usuario importado correctamente: ${userData.email || userData.name}`)
              return createdUser
            } catch (error) {
              console.error(`Error al importar usuario:`, error)
              console.error(`Datos del usuario:`, userData)
              throw error
            }
          }),
        )

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            successCount++
          } else {
            errorCount++
          }
        })

        console.log(`Procesado lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(users.length / batchSize)}`)
        console.log(`Progreso: ${successCount} éxitos, ${errorCount} errores`)
      }

      return { successCount, errorCount }
    }

    // Procesar usuarios
    const results = await processUsersBatch(users)
    console.log(`Importación de usuarios completada: ${results.successCount} éxitos, ${results.errorCount} errores`)
  } catch (error) {
    console.error("Error al importar usuarios:", error)
    console.error(error.stack)
  } finally {
    await mysqlPrisma.$disconnect()
  }
}

importUsersOnly()

