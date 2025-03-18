/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuración para la salida de producción
  output: 'standalone',
  // Ignorar errores de TypeScript durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar errores de ESLint durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración para manejar problemas con módulos del lado del servidor
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        bcrypt: false
      }
    }
    return config
  },
  // Configuración experimental
  experimental: {
    // Mantener configuraciones existentes
    excludeDefaultMomentLocales: true,
    serverComponentsExternalPackages: ['bcrypt'],
    // Desactivar la generación estática para las páginas que usan componentes del cliente
    appDir: true,
  },
  // Excluir todas las páginas problemáticas del prerenderizado estático
  unstable_excludeFiles: [
    'app/dashboard/**',
    'app/quizzes/**',
    'app/settings/**',
    'app/forgot-password/**',
    'app/reset-password/**',
    'app/login/**',
    'app/register/**',
    'app/profile/**',
    'app/chat/**'
  ],
}

export default nextConfig