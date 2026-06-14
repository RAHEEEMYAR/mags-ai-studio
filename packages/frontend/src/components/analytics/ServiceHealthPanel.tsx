'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SystemMetric } from '@/types/analytics';
import clsx from 'clsx';

interface ServiceHealthPanelProps {
  metrics: SystemMetric[];
}

export function ServiceHealthPanel({ metrics }: ServiceHealthPanelProps) {
  const groupedByService = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.service]) {
        acc[metric.service] = [];
      }
      acc[metric.service].push(metric);
      return acc;
    },
    {} as Record<string, SystemMetric[]>,
  );

  const severityColors = {
    NORMAL: 'bg-green-900/20 border-green-500/50 text-green-300',
    WARNING: 'bg-yellow-900/20 border-yellow-500/50 text-yellow-300',
    ERROR: 'bg-orange-900/20 border-orange-500/50 text-orange-300',
    CRITICAL: 'bg-red-900/20 border-red-500/50 text-red-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Service Health</h3>
      <div className="space-y-3 flex-1 overflow-y-auto">
        <AnimatePresence>
          {Object.entries(groupedByService).map(([service, serviceMetrics], idx) => {
            const worstSeverity = serviceMetrics.reduce((worst, m) => {
              const order = { CRITICAL: 0, ERROR: 1, WARNING: 2, NORMAL: 3 };
              return order[m.severity as keyof typeof order] <
                order[worst.severity as keyof typeof order]
                ? m
                : worst;
            });

            return (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className={clsx(
                  'p-3 rounded-lg border',
                  severityColors[worstSeverity.severity as keyof typeof severityColors],
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm capitalize">{service}</p>
                  <span className="text-xs">
                    {serviceMetrics.length} metric{serviceMetrics.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
