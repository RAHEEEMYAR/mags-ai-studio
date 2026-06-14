'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Threat } from '@/types/security';
import { ThreatCard } from './ThreatCard';

interface ThreatMonitorProps {
  threats: Threat[];
}

export function ThreatMonitor({ threats }: ThreatMonitorProps) {
  const sortedThreats = [...threats].sort((a, b) => b.riskScore - a.riskScore);
  const criticalThreats = sortedThreats.filter((t) => t.severity === 'critical');
  const highThreats = sortedThreats.filter((t) => t.severity === 'high');

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full overflow-y-auto space-y-4">
      <h2 className="text-xl font-bold text-white">Threat Monitor</h2>

      {criticalThreats.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-2">Critical Threats</h3>
          <AnimatePresence>
            {criticalThreats.map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ThreatCard threat={threat} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {highThreats.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-400 mb-2">High Threats</h3>
          <AnimatePresence>
            {highThreats.map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ThreatCard threat={threat} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {threats.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>✓ No threats detected</p>
        </div>
      )}
    </div>
  );
}