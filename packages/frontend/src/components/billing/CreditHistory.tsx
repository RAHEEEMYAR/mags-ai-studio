'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreditStore } from '@/stores/credit.store';
import { CreditTransaction } from '@/types/billing';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export function CreditHistory() {
  const { transactions, fetchTransactions, isLoading } = useCreditStore();

  useEffect(() => {
    fetchTransactions(20);
  }, [fetchTransactions]);

  const typeIcons = {
    CREDIT: <Plus className="text-green-400" size={18} />,
    DEBIT: <Minus className="text-red-400" size={18} />,
    REFUND: <RotateCcw className="text-blue-400" size={18} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Credit Transactions</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet</p>
          ) : (
            transactions.slice(0, 10).map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-3 flex-1">
                  {typeIcons[tx.type as keyof typeof typeIcons]}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{tx.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={clsx('text-sm font-medium', {
                    'text-green-400': tx.type === 'CREDIT',
                    'text-red-400': tx.type === 'DEBIT',
                    'text-blue-400': tx.type === 'REFUND',
                  })}>
                    {tx.type === 'DEBIT' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: ${tx.balanceAfter.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}