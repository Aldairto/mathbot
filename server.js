const fs = require("fs")
const path = require("path")
const { spawn } = require("child_process")

// Verificar si el directorio .next existe
const nextDir = path.join(__dirname, ".next")
if (!fs.existsSync(nextDir)) {
  console.error('Error: El directorio .next no existe. Asegúrate de ejecutar "npm run build" primero.')
  process.exit(1)
}

// Verificar si el archivo prerender-manifest.json existe, si no, crearlo
const prerenderManifestPath = path.join(nextDir, "prerender-manifest.json")
if (!fs.existsSync(prerenderManifestPath)) {
  console.log("Creando prerender-manifest.json vacío...")
  fs.writeFileSync(prerenderManifestPath, "{}")
}

// Iniciar Next.js
console.log("Iniciando Next.js...")
const port = process.env.PORT || 3000
const nextStart = spawn("next", ["start", "-p", port], {
  stdio: "inherit",
  shell: true,
})

nextStart.on("close", (code) => {
  console.log(`Next.js se cerró con código: ${code}`)
  process.exit(code)
})

// Manejar señales para cerrar correctamente
process.on("SIGINT", () => {
  console.log("Recibida señal SIGINT, cerrando...")
  nextStart.kill("SIGINT")
})

process.on("SIGTERM", () => {
  console.log("Recibida señal SIGTERM, cerrando...")
  nextStart.kill("SIGTERM")
})

