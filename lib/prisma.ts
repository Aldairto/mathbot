import { PrismaClient } from "@prisma/client"

// Declarar la variable global para PrismaClient
declare global {
  var prisma: PrismaClient | undefined
}

// Función para crear una instancia de PrismaClient con manejo de errores
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  } catch (error) {
    console.error("Error al crear PrismaClient:", error)
    // Devolver un cliente simulado para evitar errores en tiempo de construcción
    return {
      user: {
        findUnique: async () => null,
        create: async () => ({}),
        update: async () => ({}),
      },
      // Añadir otros modelos según sea necesario
      $connect: async () => {},
      $disconnect: async () => {},
    } as unknown as PrismaClient
  }
}

// Crear o reutilizar la instancia de PrismaClient
let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient()
  }
  prisma = global.prisma as PrismaClient
}

export default prisma

