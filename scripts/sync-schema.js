const { PrismaClient } = require("@prisma/client")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// URL de conexión a MySQL en Railway (reemplaza con tus datos reales)
const databaseUrl = process.env.DATABASE_URL || "mysql://usuario:contraseña@host:puerto/basededatos"

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
  } catch (error) {
    console.error("Error al sincronizar el esquema:", error)
  }
}

syncSchema()

