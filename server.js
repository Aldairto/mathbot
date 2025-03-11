// Importar módulos necesarios
const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const fs = require("fs")
const path = require("path")

// Configurar límites de memoria
const memoryLimit = 450 * 1024 * 1024 // 450MB
const checkInterval = 30 * 1000 // 30 segundos

// Monitorear uso de memoria
const monitorMemory = () => {
  setInterval(() => {
    const memoryUsage = process.memoryUsage()
    const usedMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024)
    console.log(`Memoria en uso: ${usedMemoryMB}MB / 450MB`)

    // Si estamos cerca del límite, intentar liberar memoria
    if (memoryUsage.rss > memoryLimit * 0.85) {
      console.log("⚠️ Uso de memoria alto, intentando liberar recursos...")
      try {
        global.gc()
      } catch (e) {
        console.log("No se pudo forzar GC. Considera ejecutar con --expose-gc")
      }
    }
  }, checkInterval)
}

// Iniciar monitoreo de memoria
monitorMemory()

// Determinar si estamos en modo de desarrollo o producción
const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = Number.parseInt(process.env.PORT || "3000", 10)

// Crear la aplicación Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Verificar si los directorios y archivos necesarios existen
const ensureDirectoriesExist = () => {
  const nextDir = path.join(__dirname, ".next")
  const serverDir = path.join(nextDir, "server")
  const publicDir = path.join(__dirname, "public")

  // Crear directorios si no existen
  ;[nextDir, serverDir, publicDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })

  // Verificar archivos necesarios
  const requiredFiles = [
    { path: path.join(nextDir, "prerender-manifest.json"), content: "{}" },
    {
      path: path.join(nextDir, "build-manifest.json"),
      content: JSON.stringify({
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
    },
    { path: path.join(serverDir, "pages-manifest.json"), content: "{}" },
  ]

  requiredFiles.forEach((file) => {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.content)
    }
  })
}

// Asegurar que los directorios y archivos existan
ensureDirectoriesExist()

// Preparar la aplicación Next.js
app.prepare().then(() => {
  // Crear el servidor HTTP
  createServer(async (req, res) => {
    try {
      // Obtener la ruta solicitada
      const parsedUrl = parse(req.url, true)

      // Registrar la solicitud para monitoreo
      console.log(`${new Date().toISOString()} - ${req.method} ${parsedUrl.pathname}`)

      // Verificar el uso de memoria actual
      const memoryUsage = process.memoryUsage()
      const usedMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024)

      // Si estamos muy cerca del límite, mostrar página de mantenimiento
      if (usedMemoryMB > 430) {
        // 430MB es muy cerca del límite de 450MB
        console.log(`⚠️ Memoria crítica (${usedMemoryMB}MB), sirviendo página de mantenimiento`)
        res.writeHead(503, { "Content-Type": "text/html" })
        res.end(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MathBot - Mantenimiento Temporal</title>
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
              .reload {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>MathBot</h1>
              <p>El servicio está experimentando alta demanda. Por favor, intenta de nuevo en unos momentos.</p>
              <button class="reload" onclick="window.location.reload()">Reintentar</button>
            </div>
          </body>
          </html>
        `)
        return
      }

      // Si la memoria está bien, manejar la solicitud normalmente
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error al procesar la solicitud:", err)
      res.statusCode = 500
      res.end("Error interno del servidor")
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Servidor listo en http://localhost:${port}`)
    console.log(`> Memoria inicial: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`)
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

// Manejar señales para cerrar correctamente
process.on("SIGINT", () => {
  console.log("Recibida señal SIGINT, cerrando...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("Recibida señal SIGTERM, cerrando...")
  process.exit(0)
})

