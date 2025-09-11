class SequentialMCPManager {
  constructor() {
    this.workflows = new Map();
    this.operationHandlers = new Map();
    this.maxConcurrentOperations = 3;
    this.runningOperations = new Set();
    this.initializeHandlers();
  }

  initializeHandlers() {
    this.registerHandler('analyze', this.handleAnalyzeOperation.bind(this));
    this.registerHandler('suggest', this.handleSuggestOperation.bind(this));
    this.registerHandler('refactor', this.handleRefactorOperation.bind(this));
    this.registerHandler('validate', this.handleValidateOperation.bind(this));
    this.registerHandler('generate', this.handleGenerateOperation.bind(this));
    this.registerHandler('test', this.handleTestOperation.bind(this));
  }

  registerHandler(operationType, handler) {
    this.operationHandlers.set(operationType, handler);
  }

  async createWorkflow(name, operations) {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const workflow = {
      id: workflowId,
      name: name,
      operations: operations.map((op, index) => ({
        ...op,
        id: `${workflowId}_op_${index}`,
        status: 'pending'
      })),
      status: 'created',
      currentOperationIndex: 0,
      results: [],
      startTime: null,
      endTime: null,
      totalTime: null
    };
    
    this.workflows.set(workflowId, workflow);
    return workflowId;
  }

  async executeWorkflow(workflowId, context = null) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status === 'running') {
      throw new Error(`Workflow ${workflowId} is already running`);
    }

    workflow.status = 'running';
    workflow.startTime = Date.now();
    workflow.results = [];

    try {
      const sortedOperations = this.sortOperationsByDependencies(workflow.operations);
      
      for (const operation of sortedOperations) {
        workflow.currentOperationIndex = workflow.operations.indexOf(operation);
        
        const canExecute = await this.checkDependencies(operation, workflow.results);
        if (!canExecute) {
          operation.status = 'skipped';
          continue;
        }

        operation.status = 'running';
        
        await this.waitForCapacity();
        this.runningOperations.add(operation.id);

        try {
          const result = await this.executeOperation(operation, context);
          workflow.results.push(result);
          operation.status = result.success ? 'completed' : 'failed';
          operation.error = result.error;
        } catch (error) {
          operation.status = 'failed';
          operation.error = error.message;
          workflow.results.push({
            operationId: operation.id,
            success: false,
            error: error.message,
            executionTime: 0
          });
        } finally {
          this.runningOperations.delete(operation.id);
        }

        if (operation.status === 'failed' && operation.priority > 5) {
          throw new Error(`Critical operation ${operation.name} failed: ${operation.error}`);
        }
      }

      workflow.status = 'completed';
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      throw error;
    } finally {
      workflow.endTime = Date.now();
      workflow.totalTime = workflow.endTime - workflow.startTime;
    }

    return workflow.results;
  }

  async executeOperation(operation, context = null) {
    const handler = this.operationHandlers.get(operation.type);
    if (!handler) {
      throw new Error(`No handler registered for operation type: ${operation.type}`);
    }

    const startTime = Date.now();
    
    try {
      const result = await handler(operation, context);
      const executionTime = Date.now() - startTime;
      
      return {
        operationId: operation.id,
        success: true,
        data: result,
        executionTime: executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        operationId: operation.id,
        success: false,
        error: error.message,
        executionTime: executionTime
      };
    }
  }

  sortOperationsByDependencies(operations) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (operation) => {
      if (visited.has(operation.id)) return;
      if (visiting.has(operation.id)) {
        throw new Error('Circular dependency detected in workflow');
      }

      visiting.add(operation.id);

      if (operation.dependencies && operation.dependencies.length > 0) {
        for (const depName of operation.dependencies) {
          const dependency = operations.find(op => op.name === depName);
          if (dependency) {
            visit(dependency);
          }
        }
      }

      visiting.delete(operation.id);
      visited.add(operation.id);
      sorted.push(operation);
    };

    for (const operation of operations) {
      visit(operation);
    }

    return sorted;
  }

  async checkDependencies(operation, results) {
    if (!operation.dependencies || operation.dependencies.length === 0) {
      return true;
    }

    for (const depName of operation.dependencies) {
      const depResult = results.find(result => {
        const workflow = this.getWorkflowByOperationId(result.operationId);
        if (!workflow) return false;
        const op = workflow.operations.find(o => o.id === result.operationId);
        return op && op.name === depName;
      });

      if (!depResult || !depResult.success) {
        return false;
      }
    }

    return true;
  }

  async waitForCapacity() {
    while (this.runningOperations.size >= this.maxConcurrentOperations) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }

  getWorkflowByOperationId(operationId) {
    for (const [, workflow] of this.workflows) {
      if (workflow.operations.some(op => op.id === operationId)) {
        return workflow;
      }
    }
    return null;
  }

  getAllWorkflows() {
    return Array.from(this.workflows.values());
  }

  cancelWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== 'running') {
      throw new Error(`Workflow ${workflowId} is not running`);
    }

    workflow.status = 'cancelled';
    workflow.endTime = Date.now();
    workflow.totalTime = workflow.endTime - workflow.startTime;

    for (const operation of workflow.operations) {
      if (operation.status === 'running' || operation.status === 'pending') {
        operation.status = 'cancelled';
      }
    }
  }

  // Operation Handlers
  async handleAnalyzeOperation(operation, context) {
    const { filePath, analysisType = 'full' } = operation.input;
    
    const analysis = {
      filePath,
      analysisType,
      timestamp: new Date().toISOString(),
      context: context ? {
        function: context.currentFunction?.functionName,
        file: context.currentFile?.filePath,
        patterns: context.architecturePatterns?.patterns || []
      } : null,
      results: {
        codeQuality: Math.random() * 100,
        complexity: Math.floor(Math.random() * 10) + 1,
        suggestions: [
          'Consider extracting complex logic into separate functions',
          'Add more comprehensive error handling',
          'Improve variable naming for clarity'
        ]
      }
    };

    return analysis;
  }

  async handleSuggestOperation(operation, context) {
    const { suggestionType = 'improvement' } = operation.input;
    
    const suggestions = {
      type: suggestionType,
      timestamp: new Date().toISOString(),
      suggestions: [
        {
          category: 'performance',
          description: 'Optimize database queries by adding indexes',
          priority: 'high',
          estimatedImpact: '30% reduction in response time'
        },
        {
          category: 'maintainability',
          description: 'Split large components into smaller, reusable ones',
          priority: 'medium',
          estimatedImpact: 'Improved code reusability'
        },
        {
          category: 'security',
          description: 'Implement rate limiting on API endpoints',
          priority: 'high',
          estimatedImpact: 'Enhanced protection against DDoS attacks'
        }
      ]
    };

    if (context) {
      suggestions.contextualSuggestions = {
        currentFunction: `Refactor ${context.currentFunction?.functionName || 'function'}`,
        codeStyle: 'Apply consistent formatting based on project style guide'
      };
    }

    return suggestions;
  }

  async handleRefactorOperation(operation, context) {
    const { refactorType = 'extract-function' } = operation.input;
    
    const refactoring = {
      type: refactorType,
      timestamp: new Date().toISOString(),
      changes: [
        {
          file: operation.input.filePath || 'unknown.js',
          type: refactorType,
          description: `Applied ${refactorType} refactoring`,
          linesChanged: Math.floor(Math.random() * 50) + 10
        }
      ],
      metrics: {
        codeReduction: `${Math.floor(Math.random() * 30)}%`,
        complexityReduction: Math.floor(Math.random() * 5) + 1,
        testCoverage: `${Math.floor(Math.random() * 20) + 70}%`
      }
    };

    return refactoring;
  }

  async handleValidateOperation(operation, context) {
    const { validationType = 'syntax' } = operation.input;
    
    const validation = {
      type: validationType,
      timestamp: new Date().toISOString(),
      valid: Math.random() > 0.2,
      errors: Math.random() > 0.8 ? [
        {
          line: 42,
          column: 15,
          message: 'Unexpected token',
          severity: 'error'
        }
      ] : [],
      warnings: [
        {
          line: 23,
          column: 8,
          message: 'Unused variable',
          severity: 'warning'
        }
      ]
    };

    return validation;
  }

  async handleGenerateOperation(operation, context) {
    const { generateType = 'function', template } = operation.input;
    
    const generation = {
      type: generateType,
      timestamp: new Date().toISOString(),
      generated: {
        type: generateType,
        name: `generated_${generateType}_${Date.now()}`,
        content: `// Generated ${generateType}\nfunction example() {\n  return 'generated';\n}`,
        language: 'javascript',
        linesOfCode: 4
      },
      metadata: {
        template: template || 'default',
        contextUsed: !!context,
        generationTime: Math.floor(Math.random() * 1000) + 500
      }
    };

    return generation;
  }

  async handleTestOperation(operation, context) {
    const { testType = 'unit' } = operation.input;
    
    const testResults = {
      type: testType,
      timestamp: new Date().toISOString(),
      passed: Math.floor(Math.random() * 10) + 15,
      failed: Math.floor(Math.random() * 3),
      skipped: Math.floor(Math.random() * 2),
      coverage: {
        lines: `${Math.floor(Math.random() * 20) + 70}%`,
        branches: `${Math.floor(Math.random() * 20) + 60}%`,
        functions: `${Math.floor(Math.random() * 20) + 75}%`,
        statements: `${Math.floor(Math.random() * 20) + 70}%`
      },
      duration: Math.floor(Math.random() * 5000) + 1000
    };

    return testResults;
  }
}

module.exports = { SequentialMCPManager };