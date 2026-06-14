import { registerAs } from '@nestjs/config';

export default registerAs('testing', () => ({
  // Test Execution
  execution: {
    parallelWorkers: parseInt(process.env.PARALLEL_WORKERS || '4'),
    testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'), // 30 seconds
    globalTimeout: parseInt(process.env.GLOBAL_TIMEOUT || '600000'), // 10 minutes
    retryFailedTests: parseInt(process.env.RETRY_FAILED_TESTS || '2'),
  },

  // Test Environment
  environment: {
    useTestDatabase: true,
    seedTestData: true,
    mockExternalServices: true,
    isolateTests: true,
  },

  // API Testing
  apiTesting: {
    enabled: true,
    generateTests: true,
    validateSchemas: true,
    testAuthHeaders: true,
    testRBACPermissions: true,
  },

  // E2E Testing
  e2eTesting: {
    enabled: true,
    browser: process.env.E2E_BROWSER || 'chromium',
    headless: process.env.E2E_HEADLESS !== 'false',
    slowmoMs: parseInt(process.env.E2E_SLOWMO || '0'),
    videoOnFailure: true,
  },

  // Load Testing
  loadTesting: {
    enabled: true,
    apiLoadTesting: true,
    websocketLoadTesting: true,
    databaseLoadTesting: false, // Optional
  },

  // Coverage
  coverage: {
    enabled: true,
    threshold: {
      lines: parseInt(process.env.COVERAGE_THRESHOLD_LINES || '70'),
      functions: parseInt(process.env.COVERAGE_THRESHOLD_FUNCTIONS || '70'),
      branches: parseInt(process.env.COVERAGE_THRESHOLD_BRANCHES || '60'),
      statements: parseInt(process.env.COVERAGE_THRESHOLD_STATEMENTS || '70'),
    },
    reportDir: process.env.COVERAGE_REPORT_DIR || './coverage',
  },

  // Bug Detection
  bugDetection: {
    enabled: true,
    autoCreateBugReports: true,
    deduplicateBugs: true,
    suggestFixes: true,
  },

  // AI Test Generation
  aiTestGeneration: {
    enabled: true,
    model: process.env.TEST_GEN_MODEL || 'gpt-4',
    generateEdgeCases: true,
    generateRegressionTests: true,
    minQualityScore: parseFloat(process.env.MIN_TEST_QUALITY || '0.7'),
  },

  // Scheduling
  scheduling: {
    runUnitTestsOnSchedule: true,
    unitTestSchedule: process.env.UNIT_TEST_SCHEDULE || '0 0 * * *', // Daily at midnight
    runE2ETestsOnSchedule: true,
    e2eTestSchedule: process.env.E2E_TEST_SCHEDULE || '0 2 * * 0', // Weekly Sunday 2am
    runLoadTestsOnSchedule: false,
    loadTestSchedule: process.env.LOAD_TEST_SCHEDULE || '0 3 * * 0',
  },

  // Reporting
  reporting: {
    generateDailyReports: true,
    generateWeeklyReports: true,
    notifyOnFailure: true,
    notifyOnCoverageChange: true,
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
  },
}));