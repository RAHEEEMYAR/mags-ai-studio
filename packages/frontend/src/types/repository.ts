export interface Repository {
  id: string;
  userId: string;
  name: string;
  description?: string;
  url?: string;
  source: 'github' | 'local';
  language?: string;
  indexStatus: 'pending' | 'indexing' | 'indexed' | 'failed';
  indexProgress: number;
  totalFiles: number;
  totalLines: number;
  totalChunks: number;
  isPublic: boolean;
  isArchived: boolean;
  lastIndexedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepositoryFile {
  id: string;
  path: string;
  name: string;
  language?: string;
  lineCount: number;
  size: number;
  functions?: any[];
  classes?: any[];
  imports: string[];
  exports: string[];
  content?: string;
  createdAt: Date;
}

export interface CodeChunk {
  id: string;
  fileId: string;
  content: string;
  startLine: number;
  endLine: number;
  chunkType: 'function' | 'class' | 'import' | 'generic';
  name?: string;
  language?: string;
}

export interface CreateRepositoryPayload {
  url: string;
  name?: string;
  description?: string;
}
