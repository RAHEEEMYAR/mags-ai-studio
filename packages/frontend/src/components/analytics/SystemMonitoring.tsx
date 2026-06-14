'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMetricsStore } from '@/stores/metrics.store';
import { KPICard } from './KPICard';
import { ServiceHealthPanel } from './ServiceHealthPanel';
import { PerformanceTimeseries } from './PerformanceTimeseries';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

export function SystemMonitoring() {
  const { systemMetrics, performanceMetrics, isLoading, error, fetchSystemMetrics } =
    useMetricsStore();

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(() => {
      fetchSystemMetrics();
    }, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [fetchSystemMetrics]);

  const healthyCount = Object.values(systemMetrics).filter(
    (m) => m.severity === 'NORMAL',
  ).length;
  const warningCount = Object.values(systemMetrics).filter(
    (m) => m.severity === 'WARNING',
  ).length;
  const criticalCount = Object.values(systemMetrics).filter(
    (m) => m.severity === 'CRITICAL',
  ).length;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">System Monitoring</h1>
        <p className="text-gray-400 mt-1">Real-time infrastructure and service health</p>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <KPICard
          title="Healthy Services"
          value={healthyCount}
          icon={<CheckCircle size={24} className="text-green-500" />}
        />
        <KPICard
          title="Warnings"
          value={warningCount}
          icon={<AlertCircle size={24} className="text-yellow-500" />}
        />
        <KPICard
          title="Critical"
          value={criticalCount}
          icon={<AlertCircle size={24} className="text-red-500" />}
        />
      </motion.div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Services Health */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <ServiceHealthPanel metrics={Object.values(systemMetrics)} />
        </motion.div>

        {/* Performance */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <PerformanceTimeseries metrics={performanceMetrics} />
        </motion.div>
      </div>

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
