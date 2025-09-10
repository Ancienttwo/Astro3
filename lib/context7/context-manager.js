const fs = require('fs').promises;
const path = require('path');

class Context7Manager {
  constructor() {
    this.contextCache = new Map();
    this.analysisHistory = [];
  }

  async analyzeContext(filePath, position) {
    const cacheKey = `${filePath}:${position.line}:${position.column}`;
    
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey);
    }

    const context = {
      currentFunction: await this.extractCurrentFunction(filePath, position),
      currentFile: await this.analyzeFile(filePath),
      moduleContext: await this.analyzeModule(filePath),
      architecturePatterns: await this.analyzeArchitecture(filePath),
      codeStyle: await this.inferCodeStyle(filePath),
      codeEvolution: await this.analyzeHistory(filePath),
      libraryUsage: await this.analyzeDependencies(filePath),
      timestamp: new Date(),
      contextDepth: 7
    };

    this.contextCache.set(cacheKey, context);
    return context;
  }

  async extractCurrentFunction(filePath, position) {
    try {
      const fileContent = await this.readFile(filePath);
      const lines = fileContent.split('\n');
      
      let functionStart = -1;
      let functionEnd = -1;
      let functionName = '';
      let braceCount = 0;
      let inFunction = false;

      for (let i = position.line - 1; i >= 0; i--) {
        const line = lines[i];
        const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\(.*\)\s*=>)/);
        
        if (functionMatch && !inFunction) {
          functionName = functionMatch[1] || functionMatch[2];
          functionStart = i;
          inFunction = true;
          break;
        }
      }

      if (functionStart !== -1) {
        for (let i = functionStart; i < lines.length; i++) {
          const line = lines[i];
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
          
          if (braceCount === 0 && i > functionStart) {
            functionEnd = i;
            break;
          }
        }
      }

      return {
        content: functionStart !== -1 && functionEnd !== -1 
          ? lines.slice(functionStart, functionEnd + 1).join('\n')
          : lines[position.line - 1] || '',
        startLine: functionStart !== -1 ? functionStart + 1 : position.line,
        endLine: functionEnd !== -1 ? functionEnd + 1 : position.line,
        functionName,
        type: 'function'
      };
    } catch (error) {
      return {
        content: '',
        startLine: position.line,
        endLine: position.line,
        type: 'function'
      };
    }
  }

  async analyzeFile(filePath) {
    try {
      const fileContent = await this.readFile(filePath);
      const lines = fileContent.split('\n');
      
      const imports = [];
      const exports = [];
      const codeBlocks = [];

      lines.forEach((line, index) => {
        if (line.trim().startsWith('import')) {
          const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
          if (importMatch) imports.push(importMatch[1]);
        }
        
        if (line.trim().startsWith('export')) {
          const exportMatch = line.match(/export\s+(?:default\s+)?(?:function|const|class|interface)\s+(\w+)/);
          if (exportMatch) exports.push(exportMatch[1]);
        }
      });

      return {
        filePath,
        fileType: filePath.split('.').pop() || 'unknown',
        imports,
        exports,
        dependencies: imports,
        lastModified: new Date(),
        codeBlocks
      };
    } catch (error) {
      return {
        filePath,
        fileType: 'unknown',
        imports: [],
        exports: [],
        dependencies: [],
        lastModified: new Date(),
        codeBlocks: []
      };
    }
  }

  async analyzeModule(filePath) {
    try {
      const packageJsonPath = await this.findPackageJson(filePath);
      if (packageJsonPath) {
        const packageContent = await this.readFile(packageJsonPath);
        const packageJson = JSON.parse(packageContent);
        
        return {
          name: packageJson.name || 'unknown',
          version: packageJson.version,
          description: packageJson.description,
          dependencies: Object.keys(packageJson.dependencies || {}),
          devDependencies: Object.keys(packageJson.devDependencies || {}),
          peerDependencies: Object.keys(packageJson.peerDependencies || {}),
          exports: [],
          type: 'internal'
        };
      }
    } catch (error) {
      // Fall back to basic analysis
    }

    return {
      name: 'unknown',
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      exports: [],
      type: 'internal'
    };
  }

  async analyzeArchitecture(filePath) {
    const pathSegments = filePath.split('/');
    const frameworks = [];
    const patterns = [];

    if (pathSegments.includes('components')) patterns.push('Component-based');
    if (pathSegments.includes('pages')) patterns.push('Page-based routing');
    if (pathSegments.includes('api')) patterns.push('API routes');
    if (pathSegments.includes('lib')) patterns.push('Utility libraries');
    if (pathSegments.includes('hooks')) patterns.push('React Hooks');
    if (pathSegments.includes('stores')) patterns.push('State management');

    if (filePath.includes('next')) frameworks.push('Next.js');
    if (filePath.includes('react')) frameworks.push('React');
    if (filePath.includes('vue')) frameworks.push('Vue.js');

    return {
      patterns,
      frameworks,
      designPrinciples: ['DRY', 'SOLID', 'Component composition'],
      codeStructure: {
        directories: pathSegments.slice(0, -1),
        fileNamingConventions: ['kebab-case', 'camelCase'],
        organizationPattern: 'feature-based'
      }
    };
  }

  async inferCodeStyle(filePath) {
    try {
      const fileContent = await this.readFile(filePath);
      const lines = fileContent.split('\n');
      
      let indentationSample = '';
      for (const line of lines) {
        if (line.match(/^\s+\S/)) {
          indentationSample = line.match(/^(\s+)/)?.[1] || '';
          break;
        }
      }

      const usesSpaces = indentationSample.includes(' ');
      const usesTabs = indentationSample.includes('\t');
      const spacesCount = indentationSample.length;

      const semicolonLines = lines.filter(line => line.trim().endsWith(';')).length;
      const totalLines = lines.filter(line => line.trim().length > 0).length;
      const usesSemicolons = semicolonLines > totalLines * 0.7;

      const singleQuotes = (fileContent.match(/'/g) || []).length;
      const doubleQuotes = (fileContent.match(/"/g) || []).length;

      return {
        indentation: usesTabs ? 'tabs' : 'spaces',
        spacesCount: usesSpaces ? spacesCount : undefined,
        semicolons: usesSemicolons,
        quotes: singleQuotes > doubleQuotes ? 'single' : 'double',
        trailingCommas: fileContent.includes(',\n'),
        maxLineLength: 100,
        namingConventions: {
          variables: 'camelCase',
          functions: 'camelCase',
          classes: 'PascalCase',
          constants: 'UPPER_SNAKE_CASE'
        }
      };
    } catch (error) {
      return {
        indentation: 'spaces',
        spacesCount: 2,
        semicolons: true,
        quotes: 'single',
        trailingCommas: true,
        maxLineLength: 100,
        namingConventions: {
          variables: 'camelCase',
          functions: 'camelCase',
          classes: 'PascalCase',
          constants: 'UPPER_SNAKE_CASE'
        }
      };
    }
  }

  async analyzeHistory(filePath) {
    return {
      frequentModifications: [],
      commonRefactorings: [],
      bugPatterns: [],
      performanceOptimizations: [],
      codeEvolutionTrends: []
    };
  }

  async analyzeDependencies(filePath) {
    try {
      const fileContext = await this.analyzeFile(filePath);
      const libraries = fileContext.imports
        .filter(imp => !imp.startsWith('.') && !imp.startsWith('/'))
        .map(name => ({
          name,
          version: 'unknown',
          usagePatterns: [],
          commonIssues: []
        }));

      return {
        libraries,
        apis: [],
        services: []
      };
    } catch (error) {
      return {
        libraries: [],
        apis: [],
        services: []
      };
    }
  }

  async generateSuggestions(context) {
    const suggestions = [];
    const warnings = [];
    const optimizations = [];
    const patterns = [];

    if (context.currentFunction.content.length > 50) {
      suggestions.push('Consider breaking down this function into smaller, more focused functions');
    }

    if (context.currentFile.imports.length > 20) {
      warnings.push('File has many imports, consider refactoring for better organization');
    }

    if (context.codeStyle.maxLineLength < 80) {
      optimizations.push('Consider increasing max line length for better readability');
    }

    patterns.push(...context.architecturePatterns.patterns);

    const result = {
      confidence: 0.85,
      suggestions,
      warnings,
      optimizations,
      patterns
    };

    this.analysisHistory.push(result);
    return result;
  }

  async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      return '';
    }
  }

  async findPackageJson(filePath) {
    const pathSegments = filePath.split('/');
    
    for (let i = pathSegments.length - 1; i >= 0; i--) {
      const testPath = pathSegments.slice(0, i + 1).join('/') + '/package.json';
      try {
        await fs.access(testPath);
        return testPath;
      } catch {
        continue;
      }
    }
    
    return null;
  }

  clearCache() {
    this.contextCache.clear();
  }

  getAnalysisHistory() {
    return [...this.analysisHistory];
  }
}

module.exports = { Context7Manager };