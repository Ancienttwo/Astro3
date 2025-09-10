import { Context7Manager, Context7, ContextAnalysisResult } from './context-manager';
import { SequentialMCPManager, MCPOperation, SequentialResult, MCPWorkflow } from './sequential-mcp';

interface CursorIntegrationConfig {
  enableContext7: boolean;
  enableSequentialMCP: boolean;
  maxContextDepth: number;
  cacheTimeout: number;
  debugMode: boolean;
}

interface CursorPosition {
  line: number;
  column: number;
  filePath: string;
}

interface CursorCompletionItem {
  label: string;
  kind: 'function' | 'variable' | 'class' | 'interface' | 'module' | 'property' | 'value';
  detail?: string;
  documentation?: string;
  insertText?: string;
  priority: number;
  context7Confidence?: number;
}

interface CursorDiagnostic {
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  source: 'context7' | 'sequential-mcp';
  code?: string;
  relatedInformation?: {
    location: CursorPosition;
    message: string;
  }[];
}

interface CursorCodeAction {
  title: string;
  kind: 'quickfix' | 'refactor' | 'source';
  edit?: {
    changes: {
      [filePath: string]: {
        range: { start: CursorPosition; end: CursorPosition };
        newText: string;
      }[];
    };
  };
  command?: {
    command: string;
    arguments?: any[];
  };
  isPreferred?: boolean;
  context7Generated?: boolean;
}

class CursorContext7Integration {
  private contextManager: Context7Manager;
  private mcpManager: SequentialMCPManager;
  private config: CursorIntegrationConfig;
  private activeWorkflows: Map<string, MCPWorkflow> = new Map();

  constructor(config: Partial<CursorIntegrationConfig> = {}) {
    this.config = {
      enableContext7: true,
      enableSequentialMCP: true,
      maxContextDepth: 7,
      cacheTimeout: 30000, // 30 seconds
      debugMode: false,
      ...config
    };

    this.contextManager = new Context7Manager();
    this.mcpManager = new SequentialMCPManager();

    this.setupMCPHandlers();
  }

  private setupMCPHandlers() {
    // Register cursor-specific MCP handlers
    this.mcpManager.registerHandler('completion', this.handleCompletionOperation.bind(this));
    this.mcpManager.registerHandler('diagnostic', this.handleDiagnosticOperation.bind(this));
    this.mcpManager.registerHandler('codeAction', this.handleCodeActionOperation.bind(this));
    this.mcpManager.registerHandler('hover', this.handleHoverOperation.bind(this));
  }

  async provideCompletions(position: CursorPosition, triggerCharacter?: string): Promise<CursorCompletionItem[]> {
    if (!this.config.enableContext7) {
      return [];
    }

    try {
      const context = await this.contextManager.analyzeContext(position.filePath, position);
      const analysisResult = await this.contextManager.generateSuggestions(context);

      const completions: CursorCompletionItem[] = [];

      // Generate context-aware completions
      if (context.currentFunction.functionName) {
        completions.push({
          label: `${context.currentFunction.functionName}_improved`,
          kind: 'function',
          detail: 'Context 7 Enhanced Function',
          documentation: `Improved version of ${context.currentFunction.functionName} based on context analysis`,
          insertText: this.generateImprovedFunction(context),
          priority: 10,
          context7Confidence: analysisResult.confidence
        });
      }

      // Add import suggestions based on context
      const suggestedImports = this.suggestImports(context);
      suggestedImports.forEach(imp => completions.push(imp));

      // Add variable suggestions based on naming conventions
      const variableSuggestions = this.suggestVariables(context, position);
      variableSuggestions.forEach(variable => completions.push(variable));

      return completions.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      if (this.config.debugMode) {
        console.error('Context7 completion error:', error);
      }
      return [];
    }
  }

  async provideDiagnostics(filePath: string): Promise<CursorDiagnostic[]> {
    if (!this.config.enableContext7) {
      return [];
    }

    try {
      // Analyze entire file context
      const context = await this.contextManager.analyzeContext(filePath, { line: 1, column: 0 });
      const analysisResult = await this.contextManager.generateSuggestions(context);

      const diagnostics: CursorDiagnostic[] = [];

      // Convert warnings to diagnostics
      analysisResult.warnings.forEach((warning, index) => {
        diagnostics.push({
          range: {
            start: { line: 1, column: 0, filePath },
            end: { line: 1, column: 100, filePath }
          },
          message: warning,
          severity: 'warning',
          source: 'context7',
          code: `C7W${index + 1}`
        });
      });

      // Convert suggestions to info diagnostics
      analysisResult.suggestions.forEach((suggestion, index) => {
        diagnostics.push({
          range: {
            start: { line: context.currentFunction.startLine, column: 0, filePath },
            end: { line: context.currentFunction.endLine, column: 0, filePath }
          },
          message: suggestion,
          severity: 'info',
          source: 'context7',
          code: `C7S${index + 1}`
        });
      });

      return diagnostics;
    } catch (error) {
      if (this.config.debugMode) {
        console.error('Context7 diagnostics error:', error);
      }
      return [];
    }
  }

  async provideCodeActions(position: CursorPosition, diagnostics: CursorDiagnostic[]): Promise<CursorCodeAction[]> {
    if (!this.config.enableSequentialMCP) {
      return [];
    }

    try {
      const context = await this.contextManager.analyzeContext(position.filePath, position);
      const actions: CursorCodeAction[] = [];

      // Create sequential MCP workflow for complex refactoring
      if (context.currentFunction.content.length > 100) {
        actions.push({
          title: 'Refactor large function with Context 7',
          kind: 'refactor',
          command: {
            command: 'context7.refactorFunction',
            arguments: [position, context]
          },
          isPreferred: true,
          context7Generated: true
        });
      }

      // Auto-fix style issues
      const styleIssues = diagnostics.filter(d => d.source === 'context7' && d.code?.startsWith('C7W'));
      if (styleIssues.length > 0) {
        actions.push({
          title: `Fix ${styleIssues.length} style issues`,
          kind: 'quickfix',
          command: {
            command: 'context7.autoFixStyle',
            arguments: [position.filePath, styleIssues, context]
          },
          context7Generated: true
        });
      }

      // Optimize imports
      if (context.currentFile.imports.length > 10) {
        actions.push({
          title: 'Optimize imports with Sequential MCP',
          kind: 'source',
          command: {
            command: 'context7.optimizeImports',
            arguments: [position.filePath, context]
          },
          context7Generated: true
        });
      }

      return actions;
    } catch (error) {
      if (this.config.debugMode) {
        console.error('Context7 code actions error:', error);
      }
      return [];
    }
  }

  async executeSequentialWorkflow(workflowType: string, context: Context7, ...args: any[]): Promise<SequentialResult[]> {
    if (!this.config.enableSequentialMCP) {
      throw new Error('Sequential MCP is disabled');
    }

    const operations = this.createWorkflowOperations(workflowType, context, ...args);
    const workflowId = await this.mcpManager.createWorkflow(`Cursor ${workflowType}`, operations);
    
    this.activeWorkflows.set(workflowId, this.mcpManager.getWorkflow(workflowId)!);
    
    try {
      const results = await this.mcpManager.executeWorkflow(workflowId, context);
      return results;
    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  private createWorkflowOperations(workflowType: string, context: Context7, ...args: any[]): Omit<MCPOperation, 'id' | 'status'>[] {
    switch (workflowType) {
      case 'refactorFunction':
        return [
          {
            type: 'analyze',
            name: 'Analyze Function Complexity',
            description: 'Analyze function for refactoring opportunities',
            input: { function: context.currentFunction },
            dependencies: [],
            priority: 1,
            estimatedTime: 500
          },
          {
            type: 'refactor',
            name: 'Extract Smaller Functions',
            description: 'Break down large function into smaller ones',
            input: { 
              code: context.currentFunction.content,
              refactorType: 'extract-function'
            },
            dependencies: ['Analyze Function Complexity'],
            priority: 2,
            estimatedTime: 1000
          },
          {
            type: 'validate',
            name: 'Validate Refactored Code',
            description: 'Ensure refactored code maintains functionality',
            input: { 
              code: '',
              validationType: 'syntax'
            },
            dependencies: ['Extract Smaller Functions'],
            priority: 3,
            estimatedTime: 300
          }
        ];

      case 'optimizeImports':
        return [
          {
            type: 'analyze',
            name: 'Analyze Import Usage',
            description: 'Analyze which imports are actually used',
            input: { file: context.currentFile },
            dependencies: [],
            priority: 1,
            estimatedTime: 200
          },
          {
            type: 'refactor',
            name: 'Optimize Import Statements',
            description: 'Remove unused imports and organize remaining ones',
            input: { 
              code: context.currentFile.codeBlocks.join('\n'),
              refactorType: 'optimize-imports'
            },
            dependencies: ['Analyze Import Usage'],
            priority: 2,
            estimatedTime: 300
          }
        ];

      case 'autoFixStyle':
        const [filePath, styleIssues] = args;
        return [
          {
            type: 'analyze',
            name: 'Analyze Style Issues',
            description: 'Categorize and prioritize style issues',
            input: { issues: styleIssues, style: context.codeStyle },
            dependencies: [],
            priority: 1,
            estimatedTime: 100
          },
          {
            type: 'refactor',
            name: 'Apply Style Fixes',
            description: 'Automatically fix style issues',
            input: { 
              filePath,
              styleGuide: context.codeStyle,
              issues: styleIssues
            },
            dependencies: ['Analyze Style Issues'],
            priority: 2,
            estimatedTime: 400
          }
        ];

      default:
        return [];
    }
  }

  private generateImprovedFunction(context: Context7): string {
    const style = context.codeStyle;
    const indent = style.indentation === 'tabs' ? '\t' : ' '.repeat(style.spacesCount || 2);
    const quote = style.quotes === 'single' ? "'" : '"';
    
    const functionName = context.currentFunction.functionName || 'improvedFunction';
    const hasAsync = context.currentFunction.content.includes('await');
    
    return `${hasAsync ? 'async ' : ''}function ${functionName}Enhanced() {
${indent}// Enhanced with Context 7 analysis
${indent}// Original patterns: ${context.architecturePatterns.patterns.join(', ')}
${indent}// TODO: Implement improved logic here
${indent}return ${quote}enhanced result${quote}${style.semicolons ? ';' : ''}
}`;
  }

  private suggestImports(context: Context7): CursorCompletionItem[] {
    const suggestions: CursorCompletionItem[] = [];
    
    // Suggest React hooks if component detected
    if (context.architecturePatterns.patterns.includes('Component-based') && 
        !context.currentFile.imports.some(imp => imp.includes('useState'))) {
      suggestions.push({
        label: 'useState',
        kind: 'function',
        detail: 'React Hook',
        documentation: 'React hook for managing state',
        insertText: 'useState',
        priority: 8,
        context7Confidence: 0.9
      });
    }

    // Suggest utility libraries based on project patterns
    if (context.libraryUsage.libraries.some(lib => lib.name.includes('lodash'))) {
      suggestions.push({
        label: 'cloneDeep',
        kind: 'function',
        detail: 'Lodash utility',
        documentation: 'Creates a deep clone of value',
        insertText: 'cloneDeep',
        priority: 6,
        context7Confidence: 0.7
      });
    }

    return suggestions;
  }

  private suggestVariables(context: Context7, position: CursorPosition): CursorCompletionItem[] {
    const suggestions: CursorCompletionItem[] = [];
    const namingStyle = context.codeStyle.namingConventions.variables;
    
    // Suggest variable names based on context
    if (context.currentFunction.functionName?.includes('handle')) {
      suggestions.push({
        label: namingStyle === 'camelCase' ? 'eventData' : 'event_data',
        kind: 'variable',
        detail: 'Context-aware variable',
        documentation: 'Suggested based on handler function context',
        insertText: namingStyle === 'camelCase' ? 'eventData' : 'event_data',
        priority: 7,
        context7Confidence: 0.8
      });
    }

    return suggestions;
  }

  // MCP Operation Handlers for Cursor Integration
  private async handleCompletionOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    const { position, triggerCharacter } = operation.input;
    const completions = await this.provideCompletions(position, triggerCharacter);
    
    return {
      operationId: operation.id,
      success: true,
      data: { completions },
      executionTime: 0,
      contextUsed: context
    };
  }

  private async handleDiagnosticOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    const { filePath } = operation.input;
    const diagnostics = await this.provideDiagnostics(filePath);
    
    return {
      operationId: operation.id,
      success: true,
      data: { diagnostics },
      executionTime: 0,
      contextUsed: context
    };
  }

  private async handleCodeActionOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    const { position, diagnostics } = operation.input;
    const actions = await this.provideCodeActions(position, diagnostics);
    
    return {
      operationId: operation.id,
      success: true,
      data: { actions },
      executionTime: 0,
      contextUsed: context
    };
  }

  private async handleHoverOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    const { position } = operation.input;
    
    if (!context) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: 'No context available for hover',
        executionTime: 0
      };
    }

    const hoverContent = this.generateHoverContent(context, position);
    
    return {
      operationId: operation.id,
      success: true,
      data: { content: hoverContent },
      executionTime: 0,
      contextUsed: context
    };
  }

  private generateHoverContent(context: Context7, position: CursorPosition): string {
    const content = [];
    
    content.push(`**Context 7 Analysis**`);
    content.push(`Function: ${context.currentFunction.functionName || 'Unknown'}`);
    content.push(`File Type: ${context.currentFile.fileType}`);
    content.push(`Architecture Patterns: ${context.architecturePatterns.patterns.join(', ')}`);
    
    if (context.libraryUsage.libraries.length > 0) {
      content.push(`Dependencies: ${context.libraryUsage.libraries.map(lib => lib.name).join(', ')}`);
    }
    
    content.push(`\n**Style Guide**`);
    content.push(`Indentation: ${context.codeStyle.indentation} (${context.codeStyle.spacesCount || 'default'})`);
    content.push(`Quotes: ${context.codeStyle.quotes}`);
    content.push(`Semicolons: ${context.codeStyle.semicolons ? 'required' : 'optional'}`);
    
    return content.join('\n');
  }

  // Public API for Cursor IDE integration
  getActiveWorkflows(): MCPWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  cancelWorkflow(workflowId: string): void {
    this.mcpManager.cancelWorkflow(workflowId);
    this.activeWorkflows.delete(workflowId);
  }

  updateConfig(newConfig: Partial<CursorIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): CursorIntegrationConfig {
    return { ...this.config };
  }

  dispose(): void {
    this.contextManager.clearCache();
    this.mcpManager.clearWorkflows();
    this.activeWorkflows.clear();
  }
}

export { 
  CursorContext7Integration, 
  type CursorIntegrationConfig, 
  type CursorPosition, 
  type CursorCompletionItem, 
  type CursorDiagnostic, 
  type CursorCodeAction 
};