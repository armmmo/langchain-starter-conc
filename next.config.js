/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
  webpack: (config) => {
    config.externals.push({
      'sharp': 'commonjs sharp',
      'canvas': 'commonjs canvas',
    });
    return config;
  },
}

module.exports = nextConfig