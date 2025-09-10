import { Context7Manager, Context7, ContextAnalysisResult } from '../context-manager';
import { SequentialMCPManager, MCPOperation, SequentialResult } from '../sequential-mcp';

// Mock fs module
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  access: jest.fn()
}));

describe('Context7Manager', () => {
  let contextManager: Context7Manager;

  beforeEach(() => {
    contextManager = new Context7Manager();
  });

  afterEach(() => {
    contextManager.clearCache();
    jest.clearAllMocks();
  });

  describe('analyzeContext', () => {
    it('should analyze context for a given file and position', async () => {
      const mockFileContent = `
import React from 'react';

function testFunction() {
  return 'Hello, World!';
}

export default testFunction;
`;

      const fs = require('fs/promises');
      fs.readFile.mockResolvedValue(mockFileContent);
      fs.access.mockResolvedValue(undefined);

      const context = await contextManager.analyzeContext('/test/file.ts', { line: 4, column: 0 });

      expect(context).toBeDefined();
      expect(context.contextDepth).toBe(7);
      expect(context.currentFile.filePath).toBe('/test/file.ts');
      expect(context.currentFile.fileType).toBe('ts');
      expect(context.currentFunction.functionName).toBe('testFunction');
    });

    it('should cache context results', async () => {
      const fs = require('fs/promises');
      fs.readFile.mockResolvedValue('function test() { return true; }');

      await contextManager.analyzeContext('/test/file.js', { line: 1, column: 0 });
      await contextManager.analyzeContext('/test/file.js', { line: 1, column: 0 });

      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const fs = require('fs/promises');
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const context = await contextManager.analyzeContext('/nonexistent/file.js', { line: 1, column: 0 });

      expect(context).toBeDefined();
      expect(context.currentFile.filePath).toBe('/nonexistent/file.js');
      expect(context.currentFile.imports).toEqual([]);
    });
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions based on context', async () => {
      const mockContext: Context7 = {
        currentFunction: {
          content: 'a'.repeat(100), // Long function
          startLine: 1,
          endLine: 5,
          functionName: 'longFunction',
          type: 'function'
        },
        currentFile: {
          filePath: '/test/file.ts',
          fileType: 'ts',
          imports: new Array(25).fill('import-item'), // Many imports
          exports: [],
          dependencies: [],
          lastModified: new Date(),
          codeBlocks: []
        },
        moduleContext: {
          name: 'test-module',
          dependencies: [],
          devDependencies: [],
          peerDependencies: [],
          exports: [],
          type: 'internal'
        },
        architecturePatterns: {
          patterns: ['Component-based'],
          frameworks: ['React'],
          designPrinciples: [],
          codeStructure: {
            directories: [],
            fileNamingConventions: [],
            organizationPattern: 'feature-based'
          }
        },
        codeStyle: {
          indentation: 'spaces',
          spacesCount: 2,
          semicolons: true,
          quotes: 'single',
          trailingCommas: true,
          maxLineLength: 80,
          namingConventions: {
            variables: 'camelCase',
            functions: 'camelCase',
            classes: 'PascalCase',
            constants: 'UPPER_SNAKE_CASE'
          }
        },
        codeEvolution: {
          frequentModifications: [],
          commonRefactorings: [],
          bugPatterns: [],
          performanceOptimizations: [],
          codeEvolutionTrends: []
        },
        libraryUsage: {
          libraries: [],
          apis: [],
          services: []
        },
        timestamp: new Date(),
        contextDepth: 7
      };

      const result = await contextManager.generateSuggestions(mockContext);

      expect(result.suggestions).toContain('Consider breaking down this function into smaller, more focused functions');
      expect(result.warnings).toContain('File has many imports, consider refactoring for better organization');
      expect(result.optimizations).toContain('Consider increasing max line length for better readability');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('clearCache', () => {
    it('should clear the context cache', async () => {
      const fs = require('fs/promises');
      fs.readFile.mockResolvedValue('function test() {}');

      await contextManager.analyzeContext('/test/file.js', { line: 1, column: 0 });
      contextManager.clearCache();
      await contextManager.analyzeContext('/test/file.js', { line: 1, column: 0 });

      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });
});

describe('SequentialMCPManager', () => {
  let mcpManager: SequentialMCPManager;

  beforeEach(() => {
    mcpManager = new SequentialMCPManager();
  });

  afterEach(() => {
    mcpManager.clearWorkflows();
  });

  describe('createWorkflow', () => {
    it('should create a new workflow with operations', async () => {
      const operations = [
        {
          type: 'analyze' as const,
          name: 'Analyze Code',
          description: 'Analyze the current code context',
          input: { filePath: '/test/file.js', position: { line: 1, column: 0 } },
          dependencies: [],
          priority: 1,
          estimatedTime: 1000
        },
        {
          type: 'suggest' as const,
          name: 'Generate Suggestions',
          description: 'Generate code suggestions',
          input: { context: 'test-context' },
          dependencies: [],
          priority: 2,
          estimatedTime: 500
        }
      ];

      const workflowId = await mcpManager.createWorkflow('Test Workflow', operations);

      expect(workflowId).toBeDefined();
      expect(workflowId).toMatch(/^workflow_\d+_[a-z0-9]+$/);

      const workflow = mcpManager.getWorkflow(workflowId);
      expect(workflow).toBeDefined();
      expect(workflow!.name).toBe('Test Workflow');
      expect(workflow!.operations).toHaveLength(2);
      expect(workflow!.status).toBe('pending');
    });
  });

  describe('executeWorkflow', () => {
    it('should execute all operations in a workflow', async () => {
      const operations = [
        {
          type: 'analyze' as const,
          name: 'Analyze Code',
          description: 'Analyze the current code context',
          input: { filePath: '/test/file.js', position: { line: 1, column: 0 } },
          dependencies: [],
          priority: 1,
          estimatedTime: 100
        },
        {
          type: 'suggest' as const,
          name: 'Generate Suggestions',
          description: 'Generate code suggestions',
          input: { context: 'test-context' },
          dependencies: [],
          priority: 2,
          estimatedTime: 100
        }
      ];

      const workflowId = await mcpManager.createWorkflow('Test Workflow', operations);
      const results = await mcpManager.executeWorkflow(workflowId);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);

      const workflow = mcpManager.getWorkflow(workflowId);
      expect(workflow!.status).toBe('completed');
      expect(workflow!.startTime).toBeDefined();
      expect(workflow!.endTime).toBeDefined();
    });

    it('should handle operation failures gracefully', async () => {
      const operations = [
        {
          type: 'validate' as const,
          name: 'Validate Code',
          description: 'Validate code syntax',
          input: { code: 'invalid javascript code {{{', validationType: 'syntax' },
          dependencies: [],
          priority: 1,
          estimatedTime: 100
        }
      ];

      const workflowId = await mcpManager.createWorkflow('Failing Workflow', operations);
      const results = await mcpManager.executeWorkflow(workflowId);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].data.issues).toBeDefined();
      expect(results[0].data.issues.some((issue: any) => issue.type === 'error')).toBe(true);
    });

    it('should skip operations when dependencies fail', async () => {
      const operations = [
        {
          type: 'analyze' as const,
          name: 'Failing Analysis',
          description: 'This will fail',
          input: { filePath: '', position: null },
          dependencies: [],
          priority: 1,
          estimatedTime: 100
        },
        {
          type: 'suggest' as const,
          name: 'Dependent Suggestion',
          description: 'This depends on the analysis',
          input: { context: 'test' },
          dependencies: ['Failing Analysis'],
          priority: 2,
          estimatedTime: 100
        }
      ];

      const workflowId = await mcpManager.createWorkflow('Dependency Test', operations);
      const results = await mcpManager.executeWorkflow(workflowId);

      const workflow = mcpManager.getWorkflow(workflowId);
      expect(workflow!.operations[1].status).toBe('skipped');
    });
  });

  describe('operation handlers', () => {
    it('should handle analyze operations', async () => {
      const operation: MCPOperation = {
        id: 'test-analyze',
        type: 'analyze',
        name: 'Test Analysis',
        description: 'Test analysis operation',
        input: { filePath: '/test/file.js', position: { line: 1, column: 0 } },
        status: 'pending',
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      };

      const result = await mcpManager.executeOperation(operation);

      expect(result.success).toBe(true);
      expect(result.data.filePath).toBe('/test/file.js');
      expect(result.data.analysisType).toBe('context7');
    });

    it('should handle refactor operations', async () => {
      const operation: MCPOperation = {
        id: 'test-refactor',
        type: 'refactor',
        name: 'Test Refactor',
        description: 'Test refactor operation',
        input: { 
          code: 'const oldName = "test";',
          refactorType: 'rename-variable',
          oldName: 'oldName',
          newName: 'newName'
        },
        status: 'pending',
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      };

      const result = await mcpManager.executeOperation(operation);

      expect(result.success).toBe(true);
      expect(result.data.refactoredCode).toContain('newName');
      expect(result.data.refactoredCode).not.toContain('oldName');
    });

    it('should handle generate operations', async () => {
      const operation: MCPOperation = {
        id: 'test-generate',
        type: 'generate',
        name: 'Test Generate',
        description: 'Test generate operation',
        input: { 
          generationType: 'function',
          prompt: 'create a hello world function'
        },
        status: 'pending',
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      };

      const result = await mcpManager.executeOperation(operation);

      expect(result.success).toBe(true);
      expect(result.data.generatedCode).toContain('function');
      expect(result.data.generatedCode).toContain('createahelloworldfunction');
    });

    it('should handle validate operations', async () => {
      const operation: MCPOperation = {
        id: 'test-validate',
        type: 'validate',
        name: 'Test Validate',
        description: 'Test validate operation',
        input: { 
          code: 'function test() { return true; }',
          validationType: 'syntax'
        },
        status: 'pending',
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      };

      const result = await mcpManager.executeOperation(operation);

      expect(result.success).toBe(true);
      expect(result.data.issues).toBeDefined();
      expect(Array.isArray(result.data.issues)).toBe(true);
    });
  });

  describe('workflow management', () => {
    it('should pause and resume workflows', async () => {
      const operations = [{
        type: 'analyze' as const,
        name: 'Analyze Code',
        description: 'Analyze the current code context',
        input: { filePath: '/test/file.js', position: { line: 1, column: 0 } },
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      }];

      const workflowId = await mcpManager.createWorkflow('Pausable Workflow', operations);
      
      mcpManager.pauseWorkflow(workflowId);
      let workflow = mcpManager.getWorkflow(workflowId);
      expect(workflow!.status).toBe('pending'); // Still pending since not started

      await mcpManager.executeWorkflow(workflowId);
      mcpManager.pauseWorkflow(workflowId);
      workflow = mcpManager.getWorkflow(workflowId);
      
      mcpManager.resumeWorkflow(workflowId);
      workflow = mcpManager.getWorkflow(workflowId);
    });

    it('should cancel workflows', async () => {
      const operations = [{
        type: 'analyze' as const,
        name: 'Analyze Code',
        description: 'Analyze the current code context',
        input: { filePath: '/test/file.js', position: { line: 1, column: 0 } },
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      }];

      const workflowId = await mcpManager.createWorkflow('Cancellable Workflow', operations);
      
      mcpManager.cancelWorkflow(workflowId);
      const workflow = mcpManager.getWorkflow(workflowId);
      expect(workflow!.status).toBe('failed');
      expect(workflow!.endTime).toBeDefined();
    });

    it('should get all workflows', async () => {
      const operations = [{
        type: 'analyze' as const,
        name: 'Analyze Code',
        description: 'Analyze the current code context',
        input: { filePath: '/test/file.js', position: { line: 1, column: 0 } },
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      }];

      await mcpManager.createWorkflow('Workflow 1', operations);
      await mcpManager.createWorkflow('Workflow 2', operations);

      const allWorkflows = mcpManager.getAllWorkflows();
      expect(allWorkflows).toHaveLength(2);
      expect(allWorkflows.map(w => w.name)).toContain('Workflow 1');
      expect(allWorkflows.map(w => w.name)).toContain('Workflow 2');
    });
  });

  describe('custom operation handlers', () => {
    it('should allow registering custom handlers', async () => {
      const customHandler = jest.fn().mockResolvedValue({
        operationId: 'custom-op',
        success: true,
        data: { custom: 'result' },
        executionTime: 50
      });

      mcpManager.registerHandler('custom' as any, customHandler);

      const operation: MCPOperation = {
        id: 'test-custom',
        type: 'custom' as any,
        name: 'Test Custom',
        description: 'Test custom operation',
        input: { customData: 'test' },
        status: 'pending',
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      };

      const result = await mcpManager.executeOperation(operation);

      expect(customHandler).toHaveBeenCalledWith(operation, undefined);
      expect(result.success).toBe(true);
      expect(result.data.custom).toBe('result');
    });
  });
});

describe('Integration Tests', () => {
  let contextManager: Context7Manager;
  let mcpManager: SequentialMCPManager;

  beforeEach(() => {
    contextManager = new Context7Manager();
    mcpManager = new SequentialMCPManager();
  });

  afterEach(() => {
    contextManager.clearCache();
    mcpManager.clearWorkflows();
  });

  it('should integrate context analysis with MCP workflow', async () => {
    const fs = require('fs/promises');
    fs.readFile.mockResolvedValue(`
      import React from 'react';
      
      function MyComponent() {
        const [state, setState] = useState(0);
        return <div>{state}</div>;
      }
      
      export default MyComponent;
    `);

    // First analyze context
    const context = await contextManager.analyzeContext('/test/component.tsx', { line: 4, column: 2 });
    
    // Then create workflow with context
    const operations = [
      {
        type: 'analyze' as const,
        name: 'Context Analysis',
        description: 'Deep context analysis',
        input: { filePath: '/test/component.tsx', position: { line: 4, column: 2 } },
        dependencies: [],
        priority: 1,
        estimatedTime: 100
      },
      {
        type: 'suggest' as const,
        name: 'Smart Suggestions',
        description: 'Generate context-aware suggestions',
        input: { context: 'analyzed' },
        dependencies: ['Context Analysis'],
        priority: 2,
        estimatedTime: 200
      },
      {
        type: 'validate' as const,
        name: 'Style Validation',
        description: 'Validate against project style guide',
        input: { 
          code: 'const [state, setState] = useState(0);',
          validationType: 'style'
        },
        dependencies: ['Context Analysis'],
        priority: 2,
        estimatedTime: 150
      }
    ];

    const workflowId = await mcpManager.createWorkflow('Context-Aware Workflow', operations);
    const results = await mcpManager.executeWorkflow(workflowId, context);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
    expect(results[0].contextUsed).toBeDefined();
    expect(results[1].data.suggestions).toBeDefined();
    expect(results[2].data.issues).toBeDefined();

    const workflow = mcpManager.getWorkflow(workflowId);
    expect(workflow!.status).toBe('completed');
    expect(workflow!.context).toEqual(context);
  });
});