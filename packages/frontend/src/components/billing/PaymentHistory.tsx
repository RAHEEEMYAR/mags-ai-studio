'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBillingStore } from '@/stores/billing.store';
import { Payment } from '@/types/billing';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export function PaymentHistory() {
  const { payments, fetchPayments, isLoading } = useBillingStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statusIcons = {
    SUCCESS: <CheckCircle className="text-green-400" size={18} />,
    FAILED: <AlertCircle className="text-red-400" size={18} />,
    PENDING: <DollarSign className="text-yellow-400" size={18} />,
    REFUNDED: <CheckCircle className="text-blue-400" size={18} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {payments.length === 0 ? (
            <p className="text-gray-400 text-sm">No payments yet</p>
          ) : (
            payments.slice(0, 10).map((payment, idx) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  {statusIcons[payment.status as keyof typeof statusIcons]}
                  <div>
                    <p className="text-sm font-medium text-white">
                      ${(payment.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={clsx('text-xs font-medium px-2 py-1 rounded', {
                  'bg-green-500/20 text-green-300': payment.status === 'SUCCESS',
                  'bg-red-500/20 text-red-300': payment.status === 'FAILED',
                  'bg-yellow-500/20 text-yellow-300': payment.status === 'PENDING',
                  'bg-blue-500/20 text-blue-300': payment.status === 'REFUNDED',
                })}>
                  {payment.status}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}