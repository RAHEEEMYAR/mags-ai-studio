'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIUsageStore } from '@/stores/ai-usage.store';
import { AIUsageStats } from '@/types/ai-usage';
import { KPICard } from './KPICard';
import { ModelComparison } from './ModelComparison';
import { DailyUsageChart } from './DailyUsageChart';
import { Zap, TrendingUp, DollarSign } from 'lucide-react';

export function AIUsageDashboard() {
  const {
    userStats,
    topModels,
    dailyUsage,
    isLoading,
    error,
    fetchUserStats,
    fetchTopModels,
    fetchDailyUsage,
  } = useAIUsageStore();

  useEffect(() => {
    fetchUserStats('current-user');
    fetchTopModels(5);
    fetchDailyUsage('current-user', 30);
  }, [fetchUserStats, fetchTopModels, fetchDailyUsage]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">AI Usage Analytics</h1>
        <p className="text-gray-400 mt-1">Monitor your AI API usage and costs</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {userStats && (
          <>
            <KPICard
              title="Total Requests"
              value={userStats.totalRequests.toLocaleString()}
              icon={<Zap size={24} />}
            />
            <KPICard
              title="Total Tokens"
              value={(userStats.totalTokens / 1000).toFixed(1) + 'K'}
              icon={<TrendingUp size={24} />}
            />
            <KPICard
              title="Total Cost"
              value={`$${userStats.totalCost.toFixed(2)}`}
              icon={<DollarSign size={24} />}
            />
            <KPICard
              title="Success Rate"
              value={`${userStats.successRate.toFixed(1)}%`}
              trend={userStats.successRate > 95 ? 'up' : 'down'}
            />
          </>
        )}
      </motion.div>

      {/* Charts */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {topModels.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ModelComparison models={topModels} />
          </motion.div>
        )}
        {dailyUsage.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DailyUsageChart data={dailyUsage} />
          </motion.div>
        )}
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
