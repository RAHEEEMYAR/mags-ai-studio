'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRepositoryStore } from '@/stores/repositories.store';
import { RepositoryList } from './RepositoryList';
import { ImportRepoModal } from './ImportRepoModal';
import { RepositoryDetail } from './RepositoryDetail';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function RepositoryDashboard() {
  const { repositories, activeRepository, fetchRepositories, isLoading } = useRepositoryStore();
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  if (isLoading && repositories.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="h-full flex gap-4 p-6 bg-slate-900">
      {/* Repository List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 space-y-4"
      >
        <button
          onClick={() => setShowImportModal(true)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + Import Repository
        </button>

        <RepositoryList repositories={repositories} />
      </motion.div>

      {/* Repository Detail */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1"
      >
        {activeRepository ? (
          <RepositoryDetail repository={activeRepository} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Select a repository to view details</p>
          </div>
        )}
      </motion.div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportRepoModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
