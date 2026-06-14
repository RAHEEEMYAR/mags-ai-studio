'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PerformanceMetric } from '@/types/analytics';

interface PerformanceTimeseriesProps {
  metrics: PerformanceMetric[];
}

export function PerformanceTimeseries({ metrics }: PerformanceTimeseriesProps) {
  const chartData = metrics.slice(0, 50).map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    duration: m.duration,
    dbDuration: m.dbDuration || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur h-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">API Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
          />
          <Line type="monotone" dataKey="duration" stroke="#60a5fa" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
