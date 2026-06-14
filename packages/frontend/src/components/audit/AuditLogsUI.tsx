'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSecurityStore } from '@/stores/security.store';
import { AuditFilterPanel } from './AuditFilterPanel';
import { AuditLogTable } from './AuditLogTable';
import { AuditExporter } from './AuditExporter';

export function AuditLogsUI() {
  const { auditLogs, fetchAuditLogs } = useSecurityStore();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchAuditLogs(filters);
  }, [filters, fetchAuditLogs]);

  return (
    <div className="h-full flex flex-col bg-slate-900 space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400">Immutable record of all system actions</p>
        </div>
        <AuditExporter />
      </div>

      {/* Filters */}
      <AuditFilterPanel onFilterChange={setFilters} />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-hidden"
      >
        <AuditLogTable logs={auditLogs} />
      </motion.div>
    </div>
  );
}