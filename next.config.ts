import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages that should be bundled for server components
  serverExternalPackages: ['postgres'],
  // Configure API routes timeout (for production builds)
  serverRuntimeConfig: {
    // Will only be available on the server side
    maxDuration: 300, // 5 minutes for seeding operations
  },
};

export default nextConfig;
