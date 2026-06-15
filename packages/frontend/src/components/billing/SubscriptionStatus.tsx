'use client';

import { motion } from 'framer-motion';
import { Subscription } from '@/types/billing';
import { useBillingStore } from '@/stores/billing.store';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface SubscriptionStatusProps {
  subscription: Subscription;
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const { upgradeSubscription, cancelSubscription, isLoading } = useBillingStore();
  const router = useRouter();

  const statusColors = {
    ACTIVE: 'bg-green-900/20 text-green-300 border-green-500/50',
    CANCELLED: 'bg-red-900/20 text-red-300 border-red-500/50',
    PAST_DUE: 'bg-yellow-900/20 text-yellow-300 border-yellow-500/50',
    EXPIRED: 'bg-gray-900/20 text-gray-300 border-gray-500/50',
  };

  const handleUpgrade = () => {
    router.push('/billing/upgrade');
  };

  const handleManage = async () => {
    if (subscription.status === 'ACTIVE') {
      // Show options to upgrade or cancel
      router.push('/billing/manage');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={clsx(
        'bg-slate-800/50 border rounded-lg p-6 backdrop-blur',
        statusColors[subscription.status as keyof typeof statusColors],
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Current Plan</h3>
          <p className="text-sm opacity-75 mt-1">{subscription.plan.name}</p>
        </div>
        <div className={clsx('p-2 rounded-lg', {
          'bg-green-500/20': subscription.status === 'ACTIVE',
          'bg-red-500/20': subscription.status === 'CANCELLED',
          'bg-yellow-500/20': subscription.status === 'PAST_DUE',
        })}>
          {subscription.status === 'ACTIVE' && <Check size={20} />}
          {subscription.status === 'PAST_DUE' && <AlertCircle size={20} />}
        </div>
      </div>

      <div className="space-y-2 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>
            Renews on{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs opacity-75">
          Billing period: {subscription.billingPeriod}
        </p>
      </div>

      {subscription.status === 'ACTIVE' && (
        <div className="flex gap-2">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
          >
            Upgrade Plan
          </button>
          <button
            onClick={handleManage}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded font-medium transition-colors"
          >
            Manage
          </button>
        </div>
      )}
    </motion.div>
  );
}