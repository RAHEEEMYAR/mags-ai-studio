import { registerAs } from '@nestjs/config';

export default registerAs('compliance', () => ({
  // GDPR Configuration
  gdpr: {
    enabled: true,
    dataRetentionDays: parseInt(process.env.GDPR_DATA_RETENTION || '2555'), // 7 years
    rightToBeForgettenDays: parseInt(process.env.GDPR_RETENTION || '30'), // 30 days to delete
    requireUserConsent: true,
    dataPortabilityEnabled: true,
  },

  // CCPA Configuration
  ccpa: {
    enabled: process.env.CCPA_ENABLED === 'true',
    dataRetentionDays: parseInt(process.env.CCPA_DATA_RETENTION || '1825'), // 5 years
  },

  // Data Export
  dataExport: {
    enabled: true,
    maxExportsPerDay: parseInt(process.env.MAX_EXPORTS_PER_DAY || '5'),
    formatOptions: ['csv', 'json', 'zip'],
    encryptExportFiles: true,
    expirationHours: parseInt(process.env.EXPORT_EXPIRATION_HOURS || '24'),
  },

  // Data Deletion
  dataDeletion: {
    enabled: true,
    requireAdminApproval: true,
    gracePeriodDays: parseInt(process.env.DELETION_GRACE_PERIOD || '30'),
    irreversibleAfterDays: parseInt(process.env.IRREVERSIBLE_DELETION_DAYS || '90'),
    trackDeletionHistory: true,
  },

  // Audit Logging
  auditLogging: {
    enabled: true,
    trackDataAccess: true,
    trackDataModification: true,
    trackAdminActions: true,
    immutableLogs: true,
  },

  // Consent Management
  consentManagement: {
    enabled: true,
    requireExplicitConsent: true,
    trackConsentHistory: true,
  },
}));