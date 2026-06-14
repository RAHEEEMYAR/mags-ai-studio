import { registerAs } from '@nestjs/config';

export default registerAs('loadTesting', () => ({
  // API Load Testing
  apiLoad: {
    enabled: true,
    warmupRequests: parseInt(process.env.LOAD_WARMUP || '100'),
    concurrentUsers: parseInt(process.env.LOAD_USERS || '100'),
    rampUpSeconds: parseInt(process.env.LOAD_RAMP_UP || '30'),
    sustainSeconds: parseInt(process.env.LOAD_SUSTAIN || '300'),
    rampDownSeconds: parseInt(process.env.LOAD_RAMP_DOWN || '30'),
  },

  // Spike Test
  spikeTest: {
    baseUsers: parseInt(process.env.SPIKE_BASE_USERS || '50'),
    peakUsers: parseInt(process.env.SPIKE_PEAK_USERS || '500'),
    rampUpSeconds: parseInt(process.env.SPIKE_RAMP_UP || '10'),
  },

  // Soak Test (long-running)
  soakTest: {
    concurrentUsers: parseInt(process.env.SOAK_USERS || '50'),
    durationHours: parseInt(process.env.SOAK_DURATION_HOURS || '2'),
  },

  // WebSocket Load Testing
  websocketLoad: {
    enabled: true,
    concurrentConnections: parseInt(process.env.WS_LOAD_CONNECTIONS || '100'),
    messagesPerSecond: parseInt(process.env.WS_LOAD_MSG_PER_SEC || '10'),
  },

  // Performance Thresholds
  thresholds: {
    p50Latency: parseInt(process.env.THRESHOLD_P50 || '200'), // ms
    p95Latency: parseInt(process.env.THRESHOLD_P95 || '500'), // ms
    p99Latency: parseInt(process.env.THRESHOLD_P99 || '1000'), // ms
    maxErrorRate: parseFloat(process.env.THRESHOLD_ERROR_RATE || '0.01'), // 1%
  },

  // Results Storage
  storeResults: true,
  resultRetentionDays: parseInt(process.env.LOAD_TEST_RETENTION || '90'),
}));