'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useErrorsStore } from '@/stores/errors.store';
import { KPICard } from './KPICard';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export function ErrorExplorer() {
  const {
    recentErrors,
    topErrors,
    totalErrors,
    criticalCount,
    unresolvedCount,
    isLoading,
    error,
    fetchRecentErrors,
    fetchErrorStats,
    resolveError,
  } = useErrorsStore();

  const [selectedError, setSelectedError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentErrors(100);
    fetchErrorStats();
  }, [fetchRecentErrors, fetchErrorStats]);

  const severityColors = {
    CRITICAL: 'bg-red-900/20 border-red-500/50',
    ERROR: 'bg-orange-900/20 border-orange-500/50',
    WARNING: 'bg-yellow-900/20 border-yellow-500/50',
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Error Explorer</h1>
        <p className="text-gray-400 mt-1">Track and manage application errors</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <KPICard
          title="Total Errors"
          value={totalErrors}
          icon={<AlertCircle size={24} />}
        />
        <KPICard
          title="Critical"
          value={criticalCount}
          icon={<AlertTriangle size={24} className="text-red-500" />}
        />
        <KPICard
          title="Unresolved"
          value={unresolvedCount}
          icon={<AlertCircle size={24} className="text-yellow-500" />}
        />
      </motion.div>

      {/* Error List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-hidden"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
        <div className="space-y-2 overflow-y-auto h-full">
          {recentErrors.map((err, idx) => (
            <motion.button
              key={err.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedError(err.id)}
              className={clsx(
                'w-full text-left p-3 rounded-lg border transition-colors',
                severityColors[err.severity as keyof typeof severityColors],
                selectedError === err.id ? 'ring-2 ring-blue-500' : '',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{err.errorType}</p>
                  <p className="text-xs opacity-75 truncate mt-1">{err.errorMessage}</p>
                </div>
                {err.resolved && <CheckCircle2 size={16} className="text-green-400" />}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
