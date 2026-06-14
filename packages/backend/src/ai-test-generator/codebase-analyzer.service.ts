import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CodebaseAnalyzerService {
  private readonly logger = new Logger(CodebaseAnalyzerService.name);

  /**
   * Analyze module structure
   */
  async analyzeModule(modulePath: string): Promise<any> {
    try {
      // Read file
      const filePath = this.resolveModulePath(modulePath);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract functions
      const functions = this.extractFunctions(content);

      // Extract classes
      const classes = this.extractClasses(content);

      // Extract imports/dependencies
      const dependencies = this.extractDependencies(content);

      return {
        modulePath,
        filePath,
        functions,
        classes,
        dependencies,
        lineCount: content.split('\n').length,
      };
    } catch (error) {
      this.logger.error(`Module analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract functions from code
   */
  private extractFunctions(code: string): any[] {
    const functionRegex = /^(?:async\s+)?(?:function\s+)?(\w+)\s*\([^)]*\)/gm;
    const arrowRegex = /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/gm;

    const functions: any[] = [];
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({ name: match[1], type: 'function' });
    }

    while ((match = arrowRegex.exec(code)) !== null) {
      functions.push({ name: match[1], type: 'arrow' });
    }

    return functions;
  }

  /**
   * Extract classes from code
   */
  private extractClasses(code: string): any[] {
    const classRegex = /class\s+(\w+)/g;
    const classes: any[] = [];
    let match;

    while ((match = classRegex.exec(code)) !== null) {
      classes.push({ name: match[1] });
    }

    return classes;
  }

  /**
   * Extract dependencies
   */
  private extractDependencies(code: string): string[] {
    const importRegex = /import.*?from\s+['"]([^'"]+)['"]/g;
    const requires = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    const dependencies: Set<string> = new Set();
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      dependencies.add(match[1]);
    }

    while ((match = requires.exec(code)) !== null) {
      dependencies.add(match[1]);
    }

    return Array.from(dependencies);
  }

  /**
   * Resolve module path
   */
  private resolveModulePath(modulePath: string): string {
    // Implementation would resolve actual file path
    return path.join(process.cwd(), 'src', modulePath);
  }
}