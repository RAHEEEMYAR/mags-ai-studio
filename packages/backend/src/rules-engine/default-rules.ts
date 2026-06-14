export const DEFAULT_SECURITY_RULES = [
  {
    name: 'Brute Force Protection - 5 Failed Logins',
    description: 'Block user after 5 failed login attempts in 5 minutes',
    condition: {
      eventType: 'auth_failed',
      failureCount: { gt: 5 },
      timeWindow: 300,
    },
    actions: [
      {
        type: 'block_user',
        duration: 900, // 15 minutes
      },
      {
        type: 'alert',
        severity: 'high',
      },
    ],
    priority: 100,
    isSystem: true,
  },
  {
    name: 'Unusual Location Login',
    description: 'Require MFA for login from new location',
    condition: {
      eventType: 'auth_login',
      isUnusualLocation: true,
    },
    actions: [
      {
        type: 'require_mfa',
      },
      {
        type: 'alert',
        severity: 'medium',
      },
    ],
    priority: 85,
    isSystem: true,
  },
  {
    name: 'Mass Data Export',
    description: 'Block user attempting to export large amount of data',
    condition: {
      eventType: 'data_export',
      dataSize: { gt: 1073741824 }, // 1GB
    },
    actions: [
      {
        type: 'block_user',
        duration: 3600,
      },
      {
        type: 'alert',
        severity: 'critical',
      },
    ],
    priority: 95,
    isSystem: true,
  },
  {
    name: 'Admin Action Audit',
    description: 'Create detailed audit log for all admin actions',
    condition: {
      eventType: 'admin_action',
    },
    actions: [
      {
        type: 'audit_log',
        detailed: true,
      },
    ],
    priority: 60,
    isSystem: true,
  },
  {
    name: 'API Rate Limit Spike',
    description: 'Throttle user making excessive API calls',
    condition: {
      eventType: 'api_call',
      callsPerMinute: { gt: 1000 },
    },
    actions: [
      {
        type: 'rate_limit',
        callsPerMinute: 100,
      },
      {
        type: 'alert',
        severity: 'high',
      },
    ],
    priority: 75,
    isSystem: true,
  },
];