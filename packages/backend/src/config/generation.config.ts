import { registerAs } from '@nestjs/config';

export default registerAs('generation', () => ({
  // AI Model Configuration
  model: {
    provider: process.env.AI_PROVIDER || 'openai',
    modelId: process.env.GENERATION_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.GENERATION_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.GENERATION_MAX_TOKENS || '8000'),
  },

  // Generation Pipeline
  pipeline: {
    maxConcurrentFiles: parseInt(process.env.MAX_CONCURRENT_FILE_GENERATION || '5'),
    fileGenerationTimeout: parseInt(process.env.FILE_GENERATION_TIMEOUT || '120000'), // 2 minutes
    maxGenerationAttempts: parseInt(process.env.MAX_GENERATION_ATTEMPTS || '3'),
    validationRetries: parseInt(process.env.VALIDATION_RETRIES || '2'),
  },

  // Supported Tech Stacks
  supportedStacks: {
    frontend: ['nextjs', 'react', 'vue', 'svelte'],
    backend: ['nestjs', 'express', 'fastapi', 'django'],
    database: ['postgres', 'mongodb', 'mysql'],
    orm: ['prisma', 'typeorm', 'sequelize'],
  },

  // Code Generation Options
  codeGen: {
    useTypeScript: true,
    includeTesting: true,
    includeDocumentation: true,
    enableESLint: true,
    codeStyle: 'prettier',
  },

  // Templates
  templates: {
    enabled: process.env.ENABLE_TEMPLATES === 'true',
    basePath: process.env.TEMPLATES_PATH || './generation/templates',
  },

  // Quality Checks
  quality: {
    validateImports: true,
    checkDependencies: true,
    lint: true,
    typeCheck: true,
  },
}));
