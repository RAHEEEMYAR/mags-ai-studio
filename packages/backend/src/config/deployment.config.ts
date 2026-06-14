import { registerAs } from '@nestjs/config';

export default registerAs('deployment', () => ({
  // Default Provider
  defaultProvider: process.env.DEFAULT_DEPLOY_PROVIDER || 'vercel',

  // Providers Configuration
  providers: {
    vercel: {
      token: process.env.VERCEL_TOKEN,
      team: process.env.VERCEL_TEAM,
      apiUrl: 'https://api.vercel.com',
    },
    heroku: {
      token: process.env.HEROKU_TOKEN,
      apiUrl: 'https://api.heroku.com',
    },
    docker: {
      registryUrl: process.env.DOCKER_REGISTRY_URL,
      username: process.env.DOCKER_USERNAME,
      token: process.env.DOCKER_TOKEN,
    },
  },

  // Deployment Configuration
  deployment: {
    timeout: parseInt(process.env.DEPLOYMENT_TIMEOUT || '1800000'), // 30 minutes
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '5000'), // 5 seconds
    maxHealthCheckAttempts: parseInt(process.env.MAX_HEALTH_CHECKS || '60'),
  },

  // Environment Management
  environment: {
    enableSecretsManagement: true,
    secretsProvider: process.env.SECRETS_PROVIDER || 'vault',
  },
}));
