/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["playwright"],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      // Fixes rare "__webpack_modules__[moduleId] is not a function" after interrupted
      // compiles/HMR drift (broken disk cache pointing at swapped chunks).
      config.cache = { type: "memory", maxGenerations: 1 };
    }
    return config;
  },
};

module.exports = nextConfig;
