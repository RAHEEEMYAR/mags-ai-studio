import { registerAs } from '@nestjs/config';

export default registerAs('threatDetection', () => ({
  // Detector Toggles
  detectors: {
    loginAnomaly: true,
    bruteForce: true,
    rateAnomaly: true,
    behaviorAnomaly: true,
    dataAccessAnomaly: true,
  },

  // Scoring
  scoring: {
    loginAnomalyWeight: 0.3,
    bruteForceWeight: 0.4,
    rateAnomalyWeight: 0.2,
    behaviorAnomalyWeight: 0.3,
    dataAccessAnomalyWeight: 0.4,
  },

  // Login Anomaly
  loginAnomaly: {
    geolocationDistanceThreshold: 1000, // km
    timeOfDayDeviation: 4, // hours
    deviceChangeScore: 25,
    newLocationScore: 30,
  },

  // Brute Force
  bruteForce: {
    failureThreshold: 5,
    timeWindow: 300, // seconds
    scorePerFailure: 15,
    maxScore: 100,
  },

  // Rate Anomaly
  rateAnomaly: {
    apiCallThreshold: 1000, // per minute
    dataTransferThreshold: 1024 * 1024, // 1GB per minute
    scoreMultiplier: 0.5,
  },

  // Behavior Anomaly
  behaviorAnomaly: {
    baselineCalculationPeriod: 30, // days
    deviationThreshold: 3, // standard deviations
    scoreMultiplier: 0.7,
  },

  // Auto-response
  autoResponse: {
    blockOnCriticalScore: true,
    criticalThreshold: 80,
    alertAdminOnHighScore: true,
    highThreshold: 60,
    requireMFAOnMediumScore: true,
    mediumThreshold: 40,
  },
}));