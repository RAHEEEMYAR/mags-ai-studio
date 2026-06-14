import { registerAs } from '@nestjs/config';

export default registerAs('build', () => ({
  // Build Configuration
  build: {
    timeout: parseInt(process.env.BUILD_TIMEOUT || '600000'), // 10 minutes
    cacheDir: process.env.BUILD_CACHE_DIR || '.build-cache',
    outputDir: process.env.BUILD_OUTPUT_DIR || './dist',
  },

  // Package Management
  packageManager: process.env.PACKAGE_MANAGER || 'pnpm',
  
  // Linting
  linting: {
    enabled: true,
    strict: process.env.STRICT_LINTING === 'true',
  },

  // Type Checking
  typeChecking: {
    enabled: true,
    level: process.env.TYPE_CHECK_LEVEL || 'strict',
  },

  // Testing
  testing: {
    enabled: false, // Optional for MVP
    framework: 'jest',
  },
}));
