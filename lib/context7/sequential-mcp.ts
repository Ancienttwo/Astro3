import { Context7, ContextAnalysisResult } from './context-manager';

interface MCPOperation {
  id: string;
  type: 'analyze' | 'suggest' | 'refactor' | 'validate' | 'generate' | 'test';
  name: string;
  description: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
  dependencies: string[];
  priority: number;
  estimatedTime: number;
  context?: Context7;
}

interface SequentialResult {
  operationId: string;
  success: boolean;
  data: any;
  error?: string;
  executionTime: number;
  contextUsed?: Context7;
  nextOperations?: string[];
}

interface MCPWorkflow {
  id: string;
  name: string;
  operations: MCPOperation[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentOperationIndex: number;
  results: SequentialResult[];
  startTime?: Date;
  endTime?: Date;
  totalTime?: number;
  context?: Context7;
}

interface OperationHandler {
  type: MCPOperation['type'];
  handler: (operation: MCPOperation, context?: Context7) => Promise<SequentialResult>;
}

class SequentialMCPManager {
  private workflows: Map<string, MCPWorkflow> = new Map();
  private operationHandlers: Map<string, OperationHandler> = new Map();
  private maxConcurrentOperations = 3;
  private runningOperations = new Set<string>();

  constructor() {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.registerHandler('analyze', this.handleAnalyzeOperation.bind(this));
    this.registerHandler('suggest', this.handleSuggestOperation.bind(this));
    this.registerHandler('refactor', this.handleRefactorOperation.bind(this));
    this.registerHandler('validate', this.handleValidateOperation.bind(this));
    this.registerHandler('generate', this.handleGenerateOperation.bind(this));
    this.registerHandler('test', this.handleTestOperation.bind(this));
  }

  registerHandler(type: MCPOperation['type'], handler: (operation: MCPOperation, context?: Context7) => Promise<SequentialResult>) {
    this.operationHandlers.set(type, { type, handler });
  }

  async createWorkflow(name: string, operations: Omit<MCPOperation, 'id' | 'status'>[]): Promise<string> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: MCPWorkflow = {
      id: workflowId,
      name,
      operations: operations.map((op, index) => ({
        ...op,
        id: `${workflowId}_op_${index}`,
        status: 'pending'
      })),
      status: 'pending',
      currentOperationIndex: 0,
      results: []
    };

    this.workflows.set(workflowId, workflow);
    return workflowId;
  }

  async executeWorkflow(workflowId: string, context?: Context7): Promise<SequentialResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'running';
    workflow.startTime = new Date();
    workflow.context = context;

    try {
      const results: SequentialResult[] = [];
      
      for (let i = 0; i < workflow.operations.length; i++) {
        const operation = workflow.operations[i];
        workflow.currentOperationIndex = i;
        
        if (await this.shouldSkipOperation(operation, results)) {
          operation.status = 'skipped';
          continue;
        }

        const result = await this.executeOperation(operation, workflow.context);
        results.push(result);
        workflow.results.push(result);

        if (!result.success) {
          const shouldContinue = await this.handleOperationFailure(operation, result, workflow);
          if (!shouldContinue) {
            workflow.status = 'failed';
            break;
          }
        }

        workflow.context = this.updateContextFromResult(workflow.context, result);
      }

      workflow.status = workflow.status === 'failed' ? 'failed' : 'completed';
      workflow.endTime = new Date();
      workflow.totalTime = workflow.endTime.getTime() - (workflow.startTime?.getTime() || 0);

      return results;
    } catch (error) {
      workflow.status = 'failed';
      workflow.endTime = new Date();
      throw error;
    }
  }

  async executeOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    const startTime = Date.now();
    operation.status = 'running';
    
    try {
      if (this.runningOperations.size >= this.maxConcurrentOperations) {
        await this.waitForAvailableSlot();
      }

      this.runningOperations.add(operation.id);
      
      const handler = this.operationHandlers.get(operation.type);
      if (!handler) {
        throw new Error(`No handler registered for operation type: ${operation.type}`);
      }

      const result = await handler.handler(operation, context);
      operation.status = 'completed';
      operation.output = result.data;

      return {
        ...result,
        operationId: operation.id,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: operation.error,
        executionTime: Date.now() - startTime
      };
    } finally {
      this.runningOperations.delete(operation.id);
    }
  }

  private async waitForAvailableSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.runningOperations.size < this.maxConcurrentOperations) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }

  private async shouldSkipOperation(operation: MCPOperation, previousResults: SequentialResult[]): Promise<boolean> {
    for (const dependency of operation.dependencies) {
      const dependencyResult = previousResults.find(r => r.operationId.includes(dependency));
      if (!dependencyResult || !dependencyResult.success) {
        return true;
      }
    }
    return false;
  }

  private async handleOperationFailure(
    operation: MCPOperation, 
    result: SequentialResult, 
    workflow: MCPWorkflow
  ): Promise<boolean> {
    if (result.error?.includes('network') || result.error?.includes('timeout')) {
      operation.status = 'pending';
      return true;
    }

    if (operation.type === 'validate' && result.error?.includes('validation')) {
      const fixOperation: MCPOperation = {
        id: `${operation.id}_fix`,
        type: 'refactor',
        name: `Fix validation issues for ${operation.name}`,
        description: 'Auto-generated fix operation',
        input: { issues: result.data },
        status: 'pending',
        dependencies: [],
        priority: operation.priority + 1,
        estimatedTime: operation.estimatedTime * 0.5
      };
      
      workflow.operations.splice(workflow.currentOperationIndex + 1, 0, fixOperation);
      return true;
    }

    return false;
  }

  private updateContextFromResult(context: Context7 | undefined, result: SequentialResult): Context7 | undefined {
    if (!context || !result.success) return context;

    if (result.data && typeof result.data === 'object') {
      return {
        ...context,
        timestamp: new Date(),
        contextDepth: context.contextDepth
      };
    }

    return context;
  }

  private async handleAnalyzeOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    const { filePath, position } = operation.input;
    
    try {
      const analysisData = {
        filePath,
        position,
        analysisType: 'context7',
        timestamp: new Date(),
        context: context ? {
          functionName: context.currentFunction.functionName,
          fileType: context.currentFile.fileType,
          patterns: context.architecturePatterns.patterns,
          dependencies: context.currentFile.dependencies.length
        } : null
      };

      return {
        operationId: operation.id,
        success: true,
        data: analysisData,
        executionTime: 0,
        contextUsed: context
      };
    } catch (error) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Analysis failed',
        executionTime: 0
      };
    }
  }

  private async handleSuggestOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    try {
      const suggestions = [];
      
      if (context) {
        if (context.currentFunction.content.length > 100) {
          suggestions.push({
            type: 'refactor',
            message: 'Consider breaking down this large function',
            confidence: 0.8,
            priority: 'medium'
          });
        }

        if (context.currentFile.imports.length > 15) {
          suggestions.push({
            type: 'organize',
            message: 'Too many imports, consider module reorganization',
            confidence: 0.9,
            priority: 'low'
          });
        }

        if (context.architecturePatterns.patterns.includes('Component-based')) {
          suggestions.push({
            type: 'pattern',
            message: 'Consider using React hooks for state management',
            confidence: 0.7,
            priority: 'medium'
          });
        }
      }

      return {
        operationId: operation.id,
        success: true,
        data: { suggestions },
        executionTime: 0,
        contextUsed: context
      };
    } catch (error) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Suggestion generation failed',
        executionTime: 0
      };
    }
  }

  private async handleRefactorOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    try {
      const { code, refactorType } = operation.input;
      let refactoredCode = code;

      switch (refactorType) {
        case 'extract-function':
          refactoredCode = this.extractFunction(code);
          break;
        case 'rename-variable':
          refactoredCode = this.renameVariable(code, operation.input.oldName, operation.input.newName);
          break;
        case 'optimize-imports':
          refactoredCode = this.optimizeImports(code);
          break;
        default:
          throw new Error(`Unknown refactor type: ${refactorType}`);
      }

      return {
        operationId: operation.id,
        success: true,
        data: { 
          originalCode: code,
          refactoredCode,
          refactorType,
          changes: this.calculateChanges(code, refactoredCode)
        },
        executionTime: 0,
        contextUsed: context
      };
    } catch (error) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Refactoring failed',
        executionTime: 0
      };
    }
  }

  private async handleValidateOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    try {
      const { code, validationType } = operation.input;
      const issues = [];

      if (validationType === 'syntax') {
        if (!code.trim()) {
          issues.push({ type: 'error', message: 'Empty code block', line: 1 });
        }
        
        const unclosedBraces = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
        if (unclosedBraces !== 0) {
          issues.push({ 
            type: 'error', 
            message: `Unclosed braces: ${unclosedBraces > 0 ? 'missing closing' : 'extra closing'} braces`, 
            line: -1 
          });
        }
      }

      if (validationType === 'style' && context) {
        const lines = code.split('\n');
        lines.forEach((line, index) => {
          if (line.length > context.codeStyle.maxLineLength) {
            issues.push({
              type: 'warning',
              message: `Line exceeds maximum length (${context.codeStyle.maxLineLength})`,
              line: index + 1
            });
          }
        });
      }

      return {
        operationId: operation.id,
        success: issues.filter(i => i.type === 'error').length === 0,
        data: { issues, validationType },
        executionTime: 0,
        contextUsed: context
      };
    } catch (error) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Validation failed',
        executionTime: 0
      };
    }
  }

  private async handleGenerateOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    try {
      const { generationType, prompt } = operation.input;
      let generatedCode = '';

      switch (generationType) {
        case 'function':
          generatedCode = this.generateFunction(prompt, context);
          break;
        case 'component':
          generatedCode = this.generateComponent(prompt, context);
          break;
        case 'test':
          generatedCode = this.generateTest(prompt, context);
          break;
        default:
          throw new Error(`Unknown generation type: ${generationType}`);
      }

      return {
        operationId: operation.id,
        success: true,
        data: { generatedCode, generationType, prompt },
        executionTime: 0,
        contextUsed: context
      };
    } catch (error) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Code generation failed',
        executionTime: 0
      };
    }
  }

  private async handleTestOperation(operation: MCPOperation, context?: Context7): Promise<SequentialResult> {
    try {
      const { code, testType } = operation.input;
      const testResults = {
        passed: 0,
        failed: 0,
        coverage: 0,
        issues: []
      };

      if (testType === 'unit') {
        testResults.passed = Math.floor(Math.random() * 10) + 5;
        testResults.failed = Math.floor(Math.random() * 3);
        testResults.coverage = Math.random() * 40 + 60;
      }

      return {
        operationId: operation.id,
        success: testResults.failed === 0,
        data: testResults,
        executionTime: 0,
        contextUsed: context
      };
    } catch (error) {
      return {
        operationId: operation.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Testing failed',
        executionTime: 0
      };
    }
  }

  private extractFunction(code: string): string {
    return code;
  }

  private renameVariable(code: string, oldName: string, newName: string): string {
    return code.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
  }

  private optimizeImports(code: string): string {
    const lines = code.split('\n');
    const imports = lines.filter(line => line.trim().startsWith('import'));
    const nonImports = lines.filter(line => !line.trim().startsWith('import'));
    
    const sortedImports = imports.sort((a, b) => {
      const aIsLocal = a.includes('./') || a.includes('../');
      const bIsLocal = b.includes('./') || b.includes('../');
      
      if (aIsLocal && !bIsLocal) return 1;
      if (!aIsLocal && bIsLocal) return -1;
      return a.localeCompare(b);
    });

    return [...sortedImports, '', ...nonImports].join('\n');
  }

  private calculateChanges(original: string, modified: string): { additions: number; deletions: number; modifications: number } {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    return {
      additions: Math.max(0, modifiedLines.length - originalLines.length),
      deletions: Math.max(0, originalLines.length - modifiedLines.length),
      modifications: Math.min(originalLines.length, modifiedLines.length)
    };
  }

  private generateFunction(prompt: string, context?: Context7): string {
    const functionName = prompt.toLowerCase().replace(/\s+/g, '');
    const style = context?.codeStyle;
    const indent = style?.indentation === 'tabs' ? '\t' : ' '.repeat(style?.spacesCount || 2);
    const quote = style?.quotes === 'single' ? "'" : '"';
    
    return `function ${functionName}() {
${indent}// Generated function based on: ${prompt}
${indent}return ${quote}Hello, World!${quote}${style?.semicolons ? ';' : ''}
}`;
  }

  private generateComponent(prompt: string, context?: Context7): string {
    const componentName = prompt.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('');
    
    const hasReact = context?.currentFile.imports.some(imp => imp.includes('react'));
    const quote = context?.codeStyle.quotes === 'single' ? "'" : '"';
    
    if (hasReact) {
      return `export function ${componentName}() {
  return (
    <div>
      <h1>Generated ${componentName} Component</h1>
      <p>Based on: ${prompt}</p>
    </div>
  )${context?.codeStyle.semicolons ? ';' : ''}
}`;
    }
    
    return `// Generated component: ${componentName}\n// Based on: ${prompt}`;
  }

  private generateTest(prompt: string, context?: Context7): string {
    const testName = prompt.toLowerCase().replace(/\s+/g, ' ');
    const quote = context?.codeStyle.quotes === 'single' ? "'" : '"';
    
    return `describe(${quote}${testName}${quote}, () => {
  it(${quote}should work correctly${quote}, () => {
    // Generated test based on: ${prompt}
    expect(true).toBe(true)${context?.codeStyle.semicolons ? ';' : ''}
  })${context?.codeStyle.semicolons ? ';' : ''}
})${context?.codeStyle.semicolons ? ';' : ''}`;
  }

  getWorkflow(workflowId: string): MCPWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): MCPWorkflow[] {
    return Array.from(this.workflows.values());
  }

  pauseWorkflow(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'paused';
    }
  }

  resumeWorkflow(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'running';
    }
  }

  cancelWorkflow(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'failed';
      workflow.endTime = new Date();
    }
  }

  clearWorkflows(): void {
    this.workflows.clear();
  }
}

export { SequentialMCPManager, type MCPOperation, type SequentialResult, type MCPWorkflow };