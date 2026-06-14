'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBillingStore } from '@/stores/billing.store';
import { useCreditStore } from '@/stores/credit.store';
import { PlanCard } from './PlanCard';
import { CreditWalletCard } from './CreditWalletCard';
import { UpcomingInvoice } from './UpcomingInvoice';
import { SubscriptionStatus } from './SubscriptionStatus';
import { PaymentHistory } from './PaymentHistory';
import { CreditHistory } from './CreditHistory';
import { AlertCircle, CreditCard, TrendingUp } from 'lucide-react';

export function BillingDashboard() {
  const {
    dashboardData,
    isLoading,
    error,
    fetchDashboardData,
  } = useBillingStore();

  const {
    wallet,
    fetchWallet,
  } = useCreditStore();

  useEffect(() => {
    fetchDashboardData();
    fetchWallet();
  }, [fetchDashboardData, fetchWallet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-gray-400 mt-2">Manage your account, invoices, and credits</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      <div className="mt-8 space-y-8">
        {/* Top Row: Subscription Status & Credit Wallet */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {dashboardData?.subscription && (
            <SubscriptionStatus subscription={dashboardData.subscription} />
          )}
          {wallet && <CreditWalletCard wallet={wallet} />}
        </motion.div>

        {/* Upcoming Invoice */}
        {dashboardData?.currentInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UpcomingInvoice invoice={dashboardData.currentInvoice} />
          </motion.div>
        )}

        {/* Bottom Row: Payment & Credit History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <PaymentHistory />
          <CreditHistory />
        </motion.div>
      </div>
    </div>
  );
}