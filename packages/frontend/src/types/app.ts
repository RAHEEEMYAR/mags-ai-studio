export interface GeneratedApp {
  id: string;
  userId: string;
  name: string;
  description?: string;
  prompt: string;
  status: 'draft' | 'generating' | 'ready' | 'deployed' | 'archived';
  generationProgress: number;
  fileCount: number;
  techStack?: Record<string, any>;
  currentVersionId?: string;
  lastGeneratedAt?: Date;
  lastDeployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppFile {
  id: string;
  appId: string;
  path: string;
  name: string;
  language: string;
  content: string;
  size: number;
  isEdited: boolean;
  createdAt: Date;
}

export interface GenerationJob {
  id: string;
  appId: string;
  status: 'pending' | 'planning' | 'generating' | 'validating' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  totalSteps: number;
  logs?: string;
  errors?: string;
  createdAt: Date;
}

export interface GenerateAppPayload {
  prompt: string;
  name?: string;
  description?: string;
  templateId?: string;
}
