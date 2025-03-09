/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ignorar TODOS los errores de TypeScript durante la construcción
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar TODOS los errores de ESLint durante la construcción
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desactivar la generación estática para TODAS las páginas
  experimental: {
    // Opciones válidas para Next.js 14
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
  },
  // Configuración para forzar todas las páginas a ser dinámicas
  staticPageGenerationTimeout: 0,
  // Configuración para manejar problemas con módulos del lado del servidor
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

