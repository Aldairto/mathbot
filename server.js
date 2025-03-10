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

// Iniciar Next.js en modo de desarrollo para evitar problemas con archivos faltantes
console.log("Iniciando Next.js en modo de desarrollo...")
const port = process.env.PORT || 3000
const nextDev = spawn("next", ["dev", "-p", port], {
  stdio: "inherit",
  shell: true,
})

nextDev.on("close", (code) => {
  console.log(`Next.js se cerró con código: ${code}`)
  process.exit(code)
})

// Manejar señales para cerrar correctamente
process.on("SIGINT", () => {
  console.log("Recibida señal SIGINT, cerrando...")
  nextDev.kill("SIGINT")
})

process.on("SIGTERM", () => {
  console.log("Recibida señal SIGTERM, cerrando...")
  nextDev.kill("SIGTERM")
})

