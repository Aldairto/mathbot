/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración para evitar la pre-renderización de páginas problemáticas
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  // Excluir la página reset-password de la generación estática
  exportPathMap: async function (defaultPathMap) {
    delete defaultPathMap['/reset-password']
    return defaultPathMap
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig