# Security Implementation Guide

## Phase 8: Audit Logging & Rules Engine

### Overview
This phase implements a comprehensive security infrastructure including immutable audit logging, threat detection, and a rules engine for automated security responses.

## Components

### 1. Audit Logging System

**Features:**
- Immutable, hash-chained audit logs
- Compliance-relevant action tracking
- Full audit trail export (JSON/CSV)
- Log integrity verification

**Usage:**
```typescript
// Log an action
await auditService.logAction(
  userId,
  'user_login',
  'user',
  userId,
  null,
  { success: true },
  { ipAddress: '192.168.1.1', userAgent: 'Mozilla...' }
);

// Verify integrity
const isValid = await auditService.verifyIntegrity(logId);

// Export logs
const csvData = await auditService.exportLogs(userId, 'csv');
```

### 2. Rules Engine

**Default Rules:**
1. **Brute Force Protection** - Block after 5 failed logins
2. **Unusual Location Login** - Require MFA from new locations
3. **Mass Data Export** - Block exports > 1GB
4. **Admin Action Audit** - Detailed logging of admin actions
5. **API Rate Limit Spike** - Throttle excessive API calls

**Usage:**
```typescript
// Evaluate rules against event
const results = await rulesEngine.evaluateRulesForEvent({
  eventType: 'auth_failed',
  failureCount: 6,
  timeWindow: 300,
});

// Create custom rule
await rulesEngine.createRule(
  'Custom Rule',
  'Description',
  { /* condition */ },
  [{ type: 'alert', severity: 'high' }]
);
```

### 3. Frontend Security Dashboard

**Components:**
- Real-time threat monitoring
- Security event feed
- Audit log viewer
- Rules management interface
- Session management

### 4. Environment Variables

**Security Settings:**
```bash
# Rate Limiting
RATE_LIMIT_API_CALLS=100
RATE_LIMIT_LOGIN=10

# Brute Force
BRUTE_FORCE_MAX_ATTEMPTS=5
BRUTE_FORCE_BLOCK_DURATION=900

# Sessions
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT=1800

# Compliance
AUDIT_RETENTION_DAYS=365
GDPR_RETENTION=30
```

## Implementation Checklist

✅ Audit Service
- [x] Hash-chained logging
- [x] Immutability guarantee
- [x] Export functionality
- [x] Integrity verification

✅ Rules Engine
- [x] Default security rules
- [x] Rule evaluation
- [x] Action execution
- [x] Custom rule creation

✅ Frontend
- [x] Security types
- [x] Security store
- [x] API clients
- [x] Dashboard components
- [x] Audit log UI

## Security Best Practices

1. **Audit Log Integrity**
   - Use hash chaining to detect tampering
   - Store logs in write-once database
   - Regular integrity verification

2. **Rule Evaluation**
   - Evaluate rules in priority order
   - Log all rule executions
   - Allow rule disabling for troubleshooting

3. **Rate Limiting**
   - Implement per-user limits
   - Use Redis for distributed rate limiting
   - Graceful degradation on limit hit

4. **Compliance**
   - Track all compliance-relevant actions
   - Maintain audit logs per regulations
   - Export capabilities for compliance audits

## Deployment Steps

### 1. Database Migration
```bash
cd packages/backend
npx prisma generate
npx prisma db push
```

### 2. Start Backend
```bash
cd packages/backend
pnpm start:dev
```

### 3. Start Frontend
```bash
cd packages/frontend
pnpm dev
```

### 4. Access Security Dashboard
- URL: `http://localhost:3000/security`
- Admin Dashboard: `http://localhost:3000/admin/security`

## API Endpoints

### Security Events
- `GET /security/events` - Get recent security events
- `GET /security/threats` - Get detected threats

### Audit Logs
- `GET /security/audit-logs` - Get audit logs with filtering
- `GET /security/audit-logs/export` - Export logs (CSV/JSON)

### Rules
- `GET /security/rules` - List all rules
- `POST /security/rules` - Create custom rule
- `PUT /security/rules/:id` - Update rule
- `DELETE /security/rules/:id` - Delete rule

### Admin
- `POST /admin/security/block-user` - Block user
- `POST /admin/security/unblock-user` - Unblock user
- `GET /security/sessions` - Get active sessions

## Next Steps (Phase 9)

- [ ] Advanced anomaly detection (ML-based)
- [ ] SIEM integration
- [ ] Automated incident response
- [ ] Security event streaming (Kafka/RabbitMQ)
- [ ] Real-time dashboards with WebSocket

## Support

For issues or questions, please refer to:
- Backend: `packages/backend/README.md`
- Frontend: `packages/frontend/README.md`
- Full docs: `SETUP_GUIDE.md`
