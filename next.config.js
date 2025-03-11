/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ignorar errores de TypeScript durante la construcción
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar errores de ESLint durante la construcción
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desactivar completamente la generación estática
  output: "standalone",
  // Opciones que se movieron fuera de experimental
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
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
  // Desactivar la generación de páginas estáticas
  distDir: process.env.NODE_ENV === "development" ? ".next" : ".next",
  generateBuildId: async () => {
    return "build-" + Date.now()
  },
}

module.exports = nextConfig

