/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para evitar redireccionamientos SSO en Vercel
  async headers() {
    return [
      {
        source: '/sign/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Configuración para rutas públicas
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
