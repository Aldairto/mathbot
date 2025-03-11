const fs = require("fs")
const path = require("path")
const { spawn } = require("child_process")

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

// Iniciar un servidor HTTP simple
const http = require("http")
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" })
  res.end(fs.readFileSync(indexPath))
})

const port = process.env.PORT || 10000
server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`)
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

