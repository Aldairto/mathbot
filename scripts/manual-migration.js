const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Función para exportar datos de SQLite a CSV
function exportSQLiteToCSV() {
  try {
    console.log("Exportando datos de SQLite a CSV...")

    // Crear directorio para archivos CSV
    const csvDir = path.join(process.cwd(), "prisma/migrations/csv")
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true })
    }

    // Ruta a la base de datos SQLite
    const dbPath = path.join(process.cwd(), "prisma/dev.db")

    // Verificar que la base de datos existe
    if (!fs.existsSync(dbPath)) {
      console.error(`Base de datos SQLite no encontrada en ${dbPath}`)
      return false
    }

    // Obtener lista de tablas
    const tablesOutput = execSync(`sqlite3 "${dbPath}" ".tables"`).toString()
    const tables = tablesOutput.trim().split(/\s+/)

    // Exportar cada tabla a CSV
    for (const table of tables) {
      if (table.startsWith("_") || table.startsWith("sqlite_")) continue

      const csvPath = path.join(csvDir, `${table}.csv`)
      console.log(`Exportando tabla ${table} a ${csvPath}...`)

      execSync(`sqlite3 -header -csv "${dbPath}" "SELECT * FROM ${table};" > "${csvPath}"`)
    }

    console.log(`Datos exportados exitosamente a ${csvDir}`)
    return true
  } catch (error) {
    console.error("Error al exportar datos a CSV:", error)
    return false
  }
}

// Función para generar scripts SQL para MySQL
function generateMySQLScripts() {
  try {
    console.log("Generando scripts SQL para MySQL...")

    // Directorio de archivos CSV
    const csvDir = path.join(process.cwd(), "prisma/migrations/csv")

    // Directorio para scripts SQL
    const sqlDir = path.join(process.cwd(), "prisma/migrations/sql")
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true })
    }

    // Verificar que el directorio CSV existe
    if (!fs.existsSync(csvDir)) {
      console.error(`Directorio CSV no encontrado en ${csvDir}`)
      return false
    }

    // Leer archivos CSV
    const csvFiles = fs.readdirSync(csvDir).filter((file) => file.endsWith(".csv"))

    // Generar script SQL para cada tabla
    for (const csvFile of csvFiles) {
      const tableName = path.basename(csvFile, ".csv")
      const csvPath = path.join(csvDir, csvFile)
      const sqlPath = path.join(sqlDir, `${tableName}.sql`)

      console.log(`Generando script SQL para tabla ${tableName}...`)

      // Leer encabezados del CSV
      const csvContent = fs.readFileSync(csvPath, "utf8")
      const lines = csvContent.trim().split("\n")
      const headers = lines[0].split(",").map((header) => header.trim())

      // Generar script SQL
      let sqlContent = `-- Importar datos para tabla ${tableName}\n`
      sqlContent += `LOAD DATA INFILE '${csvPath.replace(/\\/g, "/")}'\n`
      sqlContent += `INTO TABLE ${tableName}\n`
      sqlContent += `FIELDS TERMINATED BY ','\n`
      sqlContent += `ENCLOSED BY '"'\n`
      sqlContent += `LINES TERMINATED BY '\\n'\n`
      sqlContent += `IGNORE 1 ROWS\n`
      sqlContent += `(${headers.join(", ")});\n`

      fs.writeFileSync(sqlPath, sqlContent)
    }

    // Generar script maestro
    const masterSqlPath = path.join(sqlDir, "import_all.sql")
    let masterSqlContent = `-- Script maestro para importar todos los datos\n`

    // Orden de importación para respetar las claves foráneas
    const importOrder = [
      "User",
      "AdaptiveCurriculum",
      "Topic",
      "Message",
      "QuizResult",
      "CorrectAnswer",
      "StudyTime",
      "UserQuizState",
      "QuizAttempt",
    ]

    for (const tableName of importOrder) {
      const sqlPath = path.join(sqlDir, `${tableName}.sql`)
      if (fs.existsSync(sqlPath)) {
        masterSqlContent += `\\. ${sqlPath.replace(/\\/g, "/")}\n`
      }
    }

    fs.writeFileSync(masterSqlPath, masterSqlContent)

    console.log(`Scripts SQL generados exitosamente en ${sqlDir}`)
    return true
  } catch (error) {
    console.error("Error al generar scripts SQL:", error)
    return false
  }
}

// Función principal
async function manualMigration() {
  console.log("Iniciando migración manual...");
  
  // Exportar datos a CSV
  const csvExported = exportSQLiteToCSV();
  if (!csvExported) {
    console.error("Error al exportar datos a CSV. Abortando migración.");
    return;
  }
  
  // Generar scripts SQL
  const sqlGenerated = generateMySQLScripts();
  if (!sqlGenerated) {
    console.error("Error al generar scripts SQL. Abortando migración.");
    return;  
    console.error("Error al generar scripts SQL. Abortando migración.");
    return;
  
  console.log("Migración manual completada exitosamente.");
  console.log("Instrucciones para completar la migración:");
  console.log("1. Importa los archivos CSV a tu base de datos MySQL usando MySQL Workbench o la línea de comandos.");
  console.log("2. Alternativamente, ejecuta los scripts SQL generados en el directorio 'prisma/migrations/sql'.");
  console.log("3. Verifica que los datos se hayan importado correctamente.");
}

// Ejecutar la función principal
manualMigration();

