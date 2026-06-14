export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  category: string;
  description: string;
  ipAddress?: string;
  deviceId?: string;
  initialRiskScore: number;
  createdAt: Date;
}

export interface Threat {
  id: string;
  userId: string;
  threatType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  indicators: string[];
  confidenceScore: number;
  riskScore: number;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  ipAddress?: string;
  logHash: string;
  createdAt: Date;
}

export interface SecurityRule {
  id: string;
  name: string;
  description?: string;
  condition: Record<string, any>;
  actions: Record<string, any>[];
  priority: number;
  isEnabled: boolean;
  isSystem: boolean;
  triggeredCount: number;
  lastTriggeredAt?: Date;
}

export interface SessionLog {
  id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  deviceName?: string;
  country?: string;
  city?: string;
  loginTime: Date;
  logoutTime?: Date;
  isActive: boolean;
  isAnomalous: boolean;
  anomalyReasons: string[];
  wasTerminated: boolean;
}

export interface AnomalyScore {
  userId: string;
  score: number; // 0-100
  factors: Record<string, any>;
  calculatedAt: Date;
}

export interface ComplianceLog {
  id: string;
  userId: string;
  eventType: string;
  regulation: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  completedAt?: Date;
  createdAt: Date;
}