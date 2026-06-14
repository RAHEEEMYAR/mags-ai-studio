export interface SearchResult {
  chunkId: string;
  content: string;
  fileId: string;
  filePath: string;
  language?: string;
  chunkType: string;
  name?: string;
  similarity: number;
}

export interface SearchFilters {
  language?: string;
  type?: string;
  path?: string;
}
