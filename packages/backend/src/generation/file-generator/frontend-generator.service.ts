import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class FrontendGeneratorService {
  private readonly logger = new Logger(FrontendGeneratorService.name);

  constructor(private aiService: AIService) {}

  /**
   * Generate frontend files
   */
  async generateFiles(appId: string, architecture: any): Promise<any[]> {
    const files: any[] = [];

    // Layout
    files.push({
      path: 'packages/frontend/src/app/layout.tsx',
      name: 'layout.tsx',
      language: 'typescript',
      content: this.generateLayout(),
      generatedBy: 'frontend-generator',
    });

    // Home page
    files.push({
      path: 'packages/frontend/src/app/page.tsx',
      name: 'page.tsx',
      language: 'typescript',
      content: this.generateHomePage(),
      generatedBy: 'frontend-generator',
    });

    return files;
  }

  private generateLayout(): string {
    return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Generated App',
  description: 'Auto-generated full-stack application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
  }

  private generateHomePage(): string {
    return `'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001')
      .then(res => res.text())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-gray-600">
          {loading ? 'Loading...' : data || 'Ready to go!'}
        </p>
      </div>
    </div>
  );
}
`;
  }
}
