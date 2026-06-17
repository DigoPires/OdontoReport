import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['614a-45-239-181-158.ngrok-free.app'],
  devIndicators: false, // Desativa completamente todos os indicadores de desenvolvimento na tela
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Forwarded-Proto', value: 'https' },
        ],
      },
    ];
  },
};

export default nextConfig;