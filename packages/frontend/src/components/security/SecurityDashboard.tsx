'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSecurityStore } from '@/stores/security.store';
import { ThreatMonitor } from './ThreatMonitor';
import { AlertFeed } from './AlertFeed';
import { RiskScoreCard } from './RiskScoreCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function SecurityDashboard() {
  const {
    recentEvents,
    threats,
    isLoading,
    fetchRecentEvents,
    fetchThreats,
  } = useSecurityStore();

  useEffect(() => {
    fetchRecentEvents();
    fetchThreats();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchRecentEvents();
      fetchThreats();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchRecentEvents, fetchThreats]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const criticalThreats = threats.filter((t) => t.severity === 'critical');
  const overallRisk = Math.ceil(
    threats.reduce((sum, t) => sum + t.riskScore, 0) / Math.max(threats.length, 1),
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Security Center</h1>
        <p className="text-gray-400 mt-1">Real-time security monitoring and threat detection</p>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-4 gap-4"
      >
        <RiskScoreCard
          label="Overall Risk"
          score={overallRisk}
          color={overallRisk > 70 ? 'red' : overallRisk > 40 ? 'yellow' : 'green'}
        />
        <RiskScoreCard
          label="Critical Threats"
          score={criticalThreats.length}
          maxScore={100}
          color={criticalThreats.length > 0 ? 'red' : 'green'}
        />
        <RiskScoreCard
          label="Recent Events"
          score={recentEvents.length}
          maxScore={100}
        />
        <RiskScoreCard
          label="System Status"
          score={overallRisk < 40 ? 100 : overallRisk < 70 ? 50 : 0}
          maxScore={100}
          color={overallRisk < 40 ? 'green' : 'yellow'}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Threats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-2"
        >
          <ThreatMonitor threats={threats} />
        </motion.div>

        {/* Alert Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AlertFeed events={recentEvents} />
        </motion.div>
      </div>
    </div>
  );
}