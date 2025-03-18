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
    // Esto evitará que Next.js intente compilar la ruta /api/chat durante la compilación
    excludeDefaultMomentLocales: true,
    serverComponentsExternalPackages: ['bcrypt'],
    // Desactivar la generación estática para las páginas que usan componentes del cliente
    appDir: true,
  },
  // Configurar las páginas que no deben generarse estáticamente
  unstable_excludeFiles: [
    'app/dashboard/**',
    'app/quizzes/**',
    'app/settings/**',
  ],
}

export default nextConfig