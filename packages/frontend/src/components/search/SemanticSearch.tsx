'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '@/stores/search.store';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { SearchFilters } from './SearchFilters';
import { SearchResult } from '@/types/search';

interface SemanticSearchProps {
  repoId: string;
}

export function SemanticSearch({ repoId }: SemanticSearchProps) {
  const { query, results, isSearching, error, search, clearResults } = useSearchStore();
  const [filters, setFilters] = useState({});

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      clearResults();
      return;
    }
    await search(repoId, q, filters);
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 rounded-lg p-6 space-y-4">
      {/* Search Bar */}
      <SearchBar
        query={query}
        onSearch={handleSearch}
        isSearching={isSearching}
        placeholder="Ask about your code... (e.g., 'Where is authentication handled?')"
      />

      {/* Filters */}
      <SearchFilters filters={filters} onChange={setFilters} />

      {/* Results */}
      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.div>
        ) : results.length > 0 ? (
          <SearchResults results={results} />
        ) : query ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-sm"
          >
            No results found
          </motion.div>
        ) : (
          <div className="text-gray-500 text-sm">
            Start searching to find code snippets
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
