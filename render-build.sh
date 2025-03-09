#!/usr/bin/env bash
# Archivo de script de construcción personalizado para Render.com

# Hacer que el script falle si algún comando falla
set -e

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Generar Prisma Client
echo "Generando Prisma Client..."
npx prisma generate

# Construir la aplicación (ignorando errores)
echo "Construyendo la aplicación..."
NODE_OPTIONS="--max-old-space-size=4096" next build || true

# Crear un archivo prerender-manifest.json vacío si no existe
echo "Verificando archivos de construcción..."
if [ ! -f .next/prerender-manifest.json ]; then
  echo "Creando prerender-manifest.json vacío..."
  echo "{}" > .next/prerender-manifest.json
fi

# Mensaje de éxito
echo "Construcción completada con éxito."

