const fs = require("fs")
const path = require("path")
const http = require("http")

// Configuración para limitar el uso de memoria
const limitMemoryUsage = () => {
  // Forzar la recolección de basura cuando se alcance cierto umbral
  const memoryLimit = 450 * 1024 * 1024 // 450MB (por debajo del límite de Render)
  const interval = 30 * 1000 // Verificar cada 30 segundos

  setInterval(() => {
    const memoryUsage = process.memoryUsage()
    console.log(`Uso de memoria: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`)

    if (memoryUsage.rss > memoryLimit) {
      console.log("Forzando recolección de basura...")
      try {
        // Intentar liberar memoria
        global.gc()
        console.log(`Memoria después de GC: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`)
      } catch (e) {
        console.log("No se pudo forzar GC. Ejecuta Node.js con --expose-gc")
      }
    }
  }, interval)
}

// Intentar habilitar la gestión de memoria
try {
  limitMemoryUsage()
} catch (e) {
  console.log("No se pudo configurar el límite de memoria:", e.message)
}

// Verificar si el directorio .next existe, si no, crearlo
const nextDir = path.join(__dirname, ".next")
if (!fs.existsSync(nextDir)) {
  console.log("Creando directorio .next...")
  fs.mkdirSync(nextDir, { recursive: true })
}

// Verificar si el directorio server existe, si no, crearlo
const serverDir = path.join(nextDir, "server")
if (!fs.existsSync(serverDir)) {
  console.log("Creando directorio .next/server...")
  fs.mkdirSync(serverDir, { recursive: true })
}

// Verificar si el archivo prerender-manifest.json existe, si no, crearlo
const prerenderManifestPath = path.join(nextDir, "prerender-manifest.json")
if (!fs.existsSync(prerenderManifestPath)) {
  console.log("Creando prerender-manifest.json vacío...")
  fs.writeFileSync(prerenderManifestPath, "{}")
}

// Verificar si el archivo build-manifest.json existe, si no, crearlo
const buildManifestPath = path.join(nextDir, "build-manifest.json")
if (!fs.existsSync(buildManifestPath)) {
  console.log("Creando build-manifest.json vacío...")
  fs.writeFileSync(
    buildManifestPath,
    JSON.stringify({
      pages: {},
      devFiles: [],
      ampDevFiles: [],
      polyfillFiles: [],
      lowPriorityFiles: [],
      rootMainFiles: [],
      pages404: false,
      buildId: `build-${Date.now()}`,
      reactLoadableManifest: {},
      middleware: { pages: {} },
    }),
  )
}

// Verificar si el archivo pages-manifest.json existe, si no, crearlo
const pagesManifestPath = path.join(serverDir, "pages-manifest.json")
if (!fs.existsSync(pagesManifestPath)) {
  console.log("Creando pages-manifest.json vacío...")
  fs.writeFileSync(pagesManifestPath, "{}")
}

// Crear un archivo index.html simple para servir
const publicDir = path.join(__dirname, "public")
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const indexPath = path.join(publicDir, "index.html")
if (!fs.existsSync(indexPath)) {
  console.log("Creando index.html básico...")
  fs.writeFileSync(
    indexPath,
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MathBot</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>MathBot</h1>
    <p>El servicio está en mantenimiento. Por favor, vuelve más tarde.</p>
  </div>
</body>
</html>`,
  )
}

// Iniciar un servidor HTTP simple con gestión de memoria
const server = http.createServer((req, res) => {
  // Registrar la solicitud para monitoreo
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)

  // Servir el archivo index.html para todas las rutas
  res.writeHead(200, { "Content-Type": "text/html" })
  res.end(fs.readFileSync(indexPath))
})

const port = process.env.PORT || 10000
server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`)
  console.log(`Memoria inicial: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`)
})

// Manejar señales para cerrar correctamente
process.on("SIGINT", () => {
  console.log("Recibida señal SIGINT, cerrando...")
  server.close(() => {
    process.exit(0)
  })
})

process.on("SIGTERM", () => {
  console.log("Recibida señal SIGTERM, cerrando...")
  server.close(() => {
    process.exit(0)
  })
})

// Manejar errores no capturados
process.on("uncaughtException", (err) => {
  console.error("Error no capturado:", err)
  // No cerrar el servidor, solo registrar el error
})

// Manejar rechazos de promesas no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Rechazo de promesa no manejado:", reason)
  // No cerrar el servidor, solo registrar el error
})

