const fs = require("fs")
const path = require("path")
const sqlite3 = require("sqlite3").verbose()

// Ruta a tu base de datos SQLite
const dbPath = path.join(process.cwd(), "prisma/dev.db")

// Crear directorio para la exportación
const exportDir = path.join(process.cwd(), "prisma/migrations/data")
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true })
}

// Abrir la base de datos
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message)
    process.exit(1)
  }
  console.log("Conectado a la base de datos SQLite.")
})

// Obtener todas las tablas
db.all(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'",
  [],
  (err, tables) => {
    if (err) {
      console.error("Error al obtener las tablas:", err.message)
      db.close()
      return
    }

    // Procesar cada tabla
    let tablasCompletadas = 0
    tables.forEach((table) => {
      const nombreTabla = table.name
      console.log(`Exportando tabla: ${nombreTabla}`)

      db.all(`SELECT * FROM "${nombreTabla}"`, [], (err, rows) => {
        if (err) {
          console.error(`Error al exportar la tabla ${nombreTabla}:`, err.message)
        } else {
          fs.writeFileSync(path.join(exportDir, `${nombreTabla}.json`), JSON.stringify(rows, null, 2))
          console.log(`Tabla ${nombreTabla} exportada exitosamente.`)
        }

        tablasCompletadas++
        if (tablasCompletadas === tables.length) {
          // Cerrar la base de datos cuando todas las tablas estén procesadas
          db.close(() => {
            console.log("Conexión a la base de datos cerrada.")
            console.log(`Todos los datos exportados exitosamente a ${exportDir}`)
          })
        }
      })
    })
  },
)

