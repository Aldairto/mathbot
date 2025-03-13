const fs = require("fs")
const path = require("path")

// URL de conexión a MySQL en Railway (reemplaza con tus datos reales)
const databaseUrl = process.env.DATABASE_URL || "mysql://usuario:contraseña@host:puerto/basededatos"

function createRailwaySchema() {
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

// Ejecutar la función si este script se ejecuta directamente
if (require.main === module) {
  createRailwaySchema()
}

// Exportar la función para usarla en otros scripts
module.exports = { createRailwaySchema }

