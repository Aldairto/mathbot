#!/bin/bash
# Script para instalar dependencias manualmente
echo "Instalando dependencias manualmente..."
npm install bcryptjs@2.4.3 --save
npm install @types/bcryptjs@2.4.6 --save-dev
npm install react-markdown@9.0.1 rehype-katex@7.0.0 remark-math@6.0.0 katex@0.16.9 --save
echo "Dependencias instaladas correctamente."

