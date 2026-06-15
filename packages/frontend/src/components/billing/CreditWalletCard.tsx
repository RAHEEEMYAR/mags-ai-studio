'use client';

import { motion } from 'framer-motion';
import { CreditWallet } from '@/types/billing';
import { useRouter } from 'next/navigation';
import { Coins, Plus, TrendingDown } from 'lucide-react';

interface CreditWalletCardProps {
  wallet: CreditWallet;
}

export function CreditWalletCard({ wallet }: CreditWalletCardProps) {
  const router = useRouter();

  const handleAddCredits = () => {
    router.push('/billing/add-credits');
  };

  const handleViewHistory = () => {
    router.push('/billing/credit-history');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Credit Balance</h3>
          <p className="text-sm text-gray-400 mt-1">Available credits</p>
        </div>
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Coins className="text-blue-400" size={24} />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-bold text-white">${wallet.balance.toFixed(2)}</p>
        <p className="text-xs text-gray-400 mt-2">
          Total earned: ${wallet.totalEarned.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">
          Total spent: ${wallet.totalSpent.toFixed(2)}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleAddCredits}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
        >
          <Plus size={18} />
          Add Credits
        </button>
        <button
          onClick={handleViewHistory}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
        >
          <TrendingDown size={18} />
          View History
        </button>
      </div>
    </motion.div>
  );
}