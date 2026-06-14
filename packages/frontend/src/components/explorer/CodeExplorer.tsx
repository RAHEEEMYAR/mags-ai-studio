'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { repositoriesApi } from '@/lib/repositories-api';
import { FileTree } from './FileTree';
import { CodeViewer } from './CodeViewer';
import { RepositoryFile } from '@/types/repository';

interface CodeExplorerProps {
  repoId: string;
}

export function CodeExplorer({ repoId }: CodeExplorerProps) {
  const [structure, setStructure] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStructure = async () => {
      try {
        const data = await repositoriesApi.getRepositoryStructure(repoId);
        setStructure(data);
      } catch (error) {
        console.error('Failed to load repository structure:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStructure();
  }, [repoId]);

  const handleSelectFile = async (file: any) => {
    try {
      const content = await repositoriesApi.getFileContent(repoId, file.id);
      setSelectedFile(content);
    } catch (error) {
      console.error('Failed to load file content:', error);
    }
  };

  if (isLoading) {
    return <div>Loading repository structure...</div>;
  }

  return (
    <div className="h-full flex gap-4 bg-slate-800 rounded-lg overflow-hidden">
      {/* File Tree */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-slate-900 border-r border-slate-700 overflow-y-auto"
      >
        <FileTree
          files={structure?.fileTree}
          onSelectFile={handleSelectFile}
        />
      </motion.div>

      {/* Code Viewer */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 overflow-hidden"
      >
        {selectedFile ? (
          <CodeViewer file={selectedFile} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Select a file to view</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
