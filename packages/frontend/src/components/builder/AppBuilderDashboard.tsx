'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore } from '@/stores/generation.store';
import { AppList } from './AppList';
import { CreateAppModal } from './CreateAppModal';
import { GenerationProgress } from './GenerationProgress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function AppBuilderDashboard() {
  const {
    apps,
    activeApp,
    isGenerating,
    generationProgress,
    currentStep,
    fetchApps,
  } = useGenerationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">App Builder</h1>
            <p className="text-gray-400 mt-1">
              Generate full-stack applications powered by AI
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            + Create App
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isGenerating && (
          <GenerationProgress progress={generationProgress} step={currentStep} />
        )}

        {apps.length > 0 ? (
          <AppList apps={apps} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex items-center justify-center text-center"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✨</span>
              </div>
              <p className="text-gray-400">No apps yet. Create one to get started!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg transition hover:bg-blue-700"
              >
                Create Your First App
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAppModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
