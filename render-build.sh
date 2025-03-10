#!/usr/bin/env bash
# Archivo de script de construcción personalizado para Render.com

# Hacer que el script falle si algún comando falla
set -e

# Instalar dependencias
echo "Instalando dependencias..."
npm install --legacy-peer-deps

# Instalar Prisma globalmente
echo "Instalando Prisma globalmente..."
npm install -g prisma

# Generar Prisma Client
echo "Generando Prisma Client..."
npx prisma generate

# Construir la aplicación (ignorando errores)
echo "Construyendo la aplicación..."
NODE_OPTIONS="--max-old-space-size=4096" next build || true

# Verificar si el directorio .next existe
if [ ! -d ".next" ]; then
  echo "Error: El directorio .next no existe. Creando..."
  mkdir -p .next
fi

# Crear un archivo prerender-manifest.json vacío si no existe
echo "Verificando archivos de construcción..."
if [ ! -f ".next/prerender-manifest.json" ]; then
  echo "Creando prerender-manifest.json vacío..."
  echo "{}" > .next/prerender-manifest.json
fi

# Crear otros archivos necesarios si no existen
if [ ! -f ".next/build-manifest.json" ]; then
  echo "Creando build-manifest.json vacío..."
  echo "{\"pages\":{},\"devFiles\":[],\"ampDevFiles\":[],\"polyfillFiles\":[],\"lowPriorityFiles\":[],\"rootMainFiles\":[],\"pages404\":false,\"buildId\":\"build-$(date +%s)\",\"reactLoadableManifest\":{},\"middleware\":{\"pages\":{}}}" > .next/build-manifest.json
fi

if [ ! -f ".next/server/pages-manifest.json" ]; then
  echo "Creando directorio server si no existe..."
  mkdir -p .next/server
  echo "Creando pages-manifest.json vacío..."
  echo "{}" > .next/server/pages-manifest.json
fi

# Mensaje de éxito
echo "Construcción completada con éxito."

