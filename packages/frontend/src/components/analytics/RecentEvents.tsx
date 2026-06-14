'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ErrorLog } from '@/types/analytics';
import clsx from 'clsx';

interface RecentEventsProps {
  errors: ErrorLog[];
}

export function RecentEvents({ errors }: RecentEventsProps) {
  const severityColors = {
    CRITICAL: 'bg-red-900/20 text-red-300 border-red-500/50',
    ERROR: 'bg-orange-900/20 text-orange-300 border-orange-500/50',
    WARNING: 'bg-yellow-900/20 text-yellow-300 border-yellow-500/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
      <div className="space-y-3 flex-1 overflow-y-auto">
        <AnimatePresence>
          {errors.slice(0, 10).map((error, idx) => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.05 }}
              className={clsx(
                'p-3 rounded-lg border',
                severityColors[error.severity as keyof typeof severityColors] ||
                  'bg-gray-900/20 text-gray-300 border-gray-500/50',
              )}
            >
              <p className="font-medium text-sm truncate">{error.errorType}</p>
              <p className="text-xs opacity-75 mt-1 truncate">{error.errorMessage}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
