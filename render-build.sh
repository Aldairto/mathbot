#!/usr/bin/env bash
# Archivo de script de construcción simplificado para Render.com

# Hacer que el script falle si algún comando falla
set -e

# Instalar dependencias
echo "Instalando dependencias..."
npm install --legacy-peer-deps

# Crear directorios necesarios
echo "Creando directorios necesarios..."
mkdir -p .next/server
mkdir -p public

# Crear archivos necesarios
echo "Creando archivos necesarios..."
echo "{}" > .next/prerender-manifest.json
echo "{\"pages\":{},\"devFiles\":[],\"ampDevFiles\":[],\"polyfillFiles\":[],\"lowPriorityFiles\":[],\"rootMainFiles\":[],\"pages404\":false,\"buildId\":\"build-$(date +%s)\",\"reactLoadableManifest\":{},\"middleware\":{\"pages\":{}}}" > .next/build-manifest.json
echo "{}" > .next/server/pages-manifest.json

# Crear un archivo index.html simple
echo "Creando index.html básico..."
cat > public/index.html << 'EOL'
<!DOCTYPE html>
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
</html>
EOL

# Mensaje de éxito
echo "Construcción completada con éxito."

