import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // Event Collection
  events: {
    enabled: true,
    captureEventTypes: [
      'auth_login',
      'auth_logout',
      'auth_failed',
      'api_call',
      'admin_action',
      'data_modification',
      'system_error',
    ],
  },

  // Brute Force Detection
  bruteForce: {
    enabled: true,
    maxFailedAttempts: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS || '5'),
    windowSeconds: parseInt(process.env.BRUTE_FORCE_WINDOW || '300'), // 5 minutes
    blockDurationSeconds: parseInt(process.env.BRUTE_FORCE_BLOCK_DURATION || '900'), // 15 minutes
    progressiveLockout: true, // Exponential backoff
  },

  // Suspicious Login Detection
  suspiciousLogin: {
    enabled: true,
    checkGeolocation: true,
    checkTimeOfDay: true,
    checkDeviceChange: true,
    geolocationThreshold: 1000, // km
    requireMFAOnAnomalies: true,
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    apiCallsPerMinute: parseInt(process.env.RATE_LIMIT_API_CALLS || '100'),
    loginAttemptsPerMinute: parseInt(process.env.RATE_LIMIT_LOGIN || '10'),
    dataExportPerDay: parseInt(process.env.RATE_LIMIT_DATA_EXPORT || '5'),
  },

  // Threat Detection
  threatDetection: {
    enabled: true,
    anomalyThreshold: parseFloat(process.env.ANOMALY_THRESHOLD || '0.7'),
    confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.8'),
    autoBlockOn: ['critical_threat', 'mass_data_export_attempt'],
  },

  // Session Management
  session: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800'), // 30 minutes
    enableDeviceTracking: true,
    enableIPTracking: true,
  },

  // IP & Geolocation
  ipTracking: {
    enabled: true,
    checkProxyVPN: true,
    geoLocationService: process.env.GEO_SERVICE || 'maxmind', // maxmind, ip2location
  },

  // Audit Logging
  audit: {
    enabled: true,
    immutable: true, // Hash chaining for tamper detection
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '365'),
    enableEncryption: true,
  },

  // Security Headers
  headers: {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'content-security-policy': "default-src 'self'",
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
}));