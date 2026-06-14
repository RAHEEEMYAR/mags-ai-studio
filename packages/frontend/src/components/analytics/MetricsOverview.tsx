'use client';

import { motion } from 'framer-motion';

interface MetricsOverviewProps {
  metrics: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
  };
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const metricsList = [
    {
      label: 'Average Latency',
      value: `${metrics.avgLatency.toFixed(0)}ms`,
      status: metrics.avgLatency < 500 ? 'good' : 'warning',
    },
    {
      label: 'P95 Latency',
      value: `${metrics.p95Latency.toFixed(0)}ms`,
      status: metrics.p95Latency < 1000 ? 'good' : 'warning',
    },
    {
      label: 'Error Rate',
      value: `${(metrics.errorRate * 100).toFixed(2)}%`,
      status: metrics.errorRate < 0.01 ? 'good' : 'warning',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        {metricsList.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
          >
            <span className="text-gray-300">{metric.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">{metric.value}</span>
              <span
                className={`w-3 h-3 rounded-full ${
                  metric.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
