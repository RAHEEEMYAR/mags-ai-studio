'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore } from '@/stores/generation.store';
import { useEditorStore } from '@/stores/editor.store';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { EditorTabs } from './EditorTabs';
import { AIEditPanel } from './AIEditPanel';

interface AIAppEditorProps {
  appId: string;
}

export function AIAppEditor({ appId }: AIAppEditorProps) {
  const { activeApp, fetchApp } = useGenerationStore();
  const { openFiles, activeFileId } = useEditorStore();
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    fetchApp(appId);
  }, [appId, fetchApp]);

  if (!activeApp) {
    return <div>Loading app...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{activeApp.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            {showAIPanel ? '✓ Close AI' : '✨ Edit with AI'}
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* File Tree */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto"
        >
          <FileTree appId={appId} />
        </motion.div>

        {/* Code Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col"
        >
          <EditorTabs />
          {activeFileId && <CodeEditor />}
        </motion.div>

        {/* AI Edit Panel */}
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto"
          >
            <AIEditPanel appId={appId} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
