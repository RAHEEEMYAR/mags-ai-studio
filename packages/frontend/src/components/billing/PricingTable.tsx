'use client';

import { motion } from 'framer-motion';
import { Plan } from '@/types/billing';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

interface PricingTableProps {
  plans: Plan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
  isYearly?: boolean;
}

export function PricingTable({
  plans,
  currentPlanId,
  onSelectPlan,
  isYearly = false,
}: PricingTableProps) {
  const sortedPlans = [...plans].sort(
    (a, b) =>
      (isYearly ? a.yearlyPrice : a.monthlyPrice) -
      (isYearly ? b.yearlyPrice : b.monthlyPrice),
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sortedPlans.map((plan, idx) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={clsx(
            'bg-slate-800/50 border rounded-lg p-6 backdrop-blur flex flex-col',
            currentPlanId === plan.id
              ? 'border-blue-500 ring-2 ring-blue-500'
              : 'border-slate-700',
          )}
        >
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-gray-400 mt-2">{plan.description}</p>

          <div className="mt-4 mb-6">
            <p className="text-3xl font-bold text-white">
              ${isYearly ? (plan.yearlyPrice / 100 / 12).toFixed(0) : (plan.monthlyPrice / 100).toFixed(0)}
            </p>
            <p className="text-xs text-gray-400">/month</p>
            {isYearly && (
              <p className="text-xs text-green-400 mt-2">
                Save {Math.round((1 - (plan.yearlyPrice / (plan.monthlyPrice * 12))) * 100)}% yearly
              </p>
            )}
          </div>

          <button
            onClick={() => onSelectPlan(plan.id)}
            disabled={currentPlanId === plan.id}
            className={clsx(
              'w-full px-4 py-2 rounded font-medium transition-colors mb-6',
              currentPlanId === plan.id
                ? 'bg-slate-700 text-gray-300 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white',
            )}
          >
            {currentPlanId === plan.id ? 'Current Plan' : 'Select'}
          </button>

          <div className="space-y-3 flex-1">
            {Object.entries(plan.features).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3 text-sm">
                {typeof value === 'boolean' && value ? (
                  <Check className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                ) : typeof value === 'boolean' && !value ? (
                  <X className="text-gray-500 flex-shrink-0 mt-0.5" size={16} />
                ) : (
                  <Check className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                )}
                <span className="text-gray-300">
                  {typeof value === 'number'
                    ? `${value.toLocaleString()} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                    : key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}