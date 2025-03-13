const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

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

async function createTestUser() {
  try {
    console.log("Creando usuario de prueba en la base de datos MySQL...")

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash("password123", 10)

    // Crear usuario de prueba
    const testUser = await mysqlPrisma.user.create({
      data: {
        name: "Usuario de Prueba",
        email: "test@example.com",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log("Usuario de prueba creado exitosamente:")
    console.log({
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
    })

    // Crear currículo adaptativo para el usuario
    const curriculum = await mysqlPrisma.adaptiveCurriculum.create({
      data: {
        userId: testUser.id,
        lastUpdated: new Date(),
      },
    })

    console.log("Currículo adaptativo creado exitosamente:", curriculum.id)

    // Crear algunos temas para el currículo
    const topics = [
      { mainTopic: "Álgebra", subTopic: "Ecuaciones lineales", difficulty: 0.5, importance: 0.8 },
      { mainTopic: "Geometría", subTopic: "Triángulos", difficulty: 0.6, importance: 0.7 },
      { mainTopic: "Probabilidad", subTopic: "Eventos independientes", difficulty: 0.7, importance: 0.6 },
    ]

    for (const topic of topics) {
      await mysqlPrisma.topic.create({
        data: {
          ...topic,
          curriculumId: curriculum.id,
        },
      })
    }

    console.log("Temas creados exitosamente")

    // Crear algunos mensajes de ejemplo
    const messages = [
      { content: "Hola, ¿cómo puedo resolver ecuaciones lineales?", role: "user" },
      {
        content:
          "Para resolver ecuaciones lineales, sigue estos pasos:\n\n1. Agrupa los términos con variables en un lado y los números en el otro.\n2. Combina términos semejantes.\n3. Despeja la variable dividiendo ambos lados por el coeficiente de la variable.\n\nPor ejemplo, para resolver $2x + 3 = 7$:\n\n1. $2x = 7 - 3$\n2. $2x = 4$\n3. $x = 4/2 = 2$\n\n¿Te gustaría ver otro ejemplo?",
        role: "assistant",
      },
    ]

    for (const message of messages) {
      await mysqlPrisma.message.create({
        data: {
          ...message,
          userId: testUser.id,
          createdAt: new Date(),
        },
      })
    }

    console.log("Mensajes creados exitosamente")

    console.log("Datos de prueba creados exitosamente")
  } catch (error) {
    console.error("Error al crear usuario de prueba:", error)
  } finally {
    await mysqlPrisma.$disconnect()
  }
}

createTestUser()

