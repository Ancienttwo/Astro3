#!/usr/bin/env node

// Try to load from pnpm node_modules first, then fallback to regular node_modules
let Server, StdioServerTransport, CallToolRequestSchema, ListToolsRequestSchema;

try {
  // Try pnpm path
  const sdkPath = require.resolve('@modelcontextprotocol/sdk/package.json');
  const sdkDir = require('path').dirname(sdkPath);
  
  Server = require(sdkDir + '/server/index.js').Server;
  StdioServerTransport = require(sdkDir + '/server/stdio.js').StdioServerTransport;
  const types = require(sdkDir + '/types.js');
  CallToolRequestSchema = types.CallToolRequestSchema;
  ListToolsRequestSchema = types.ListToolsRequestSchema;
} catch (e) {
  // Fallback to regular require
  Server = require('@modelcontextprotocol/sdk/server/index.js').Server;
  StdioServerTransport = require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
  const types = require('@modelcontextprotocol/sdk/types.js');
  CallToolRequestSchema = types.CallToolRequestSchema;
  ListToolsRequestSchema = types.ListToolsRequestSchema;
}

// Import our Sequential MCP implementation
const { SequentialMCPManager } = require('./sequential-mcp.js');
const { Context7Manager } = require('./context-manager.js');

class SequentialMCPServer {
  constructor() {
    this.mcpManager = new SequentialMCPManager();
    this.contextManager = new Context7Manager();
    this.server = new Server(
      {
        name: 'sequential-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_workflow',
            description: 'Create a new sequential MCP workflow with multiple operations',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the workflow'
                },
                operations: {
                  type: 'array',
                  description: 'Array of operations to execute sequentially',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['analyze', 'suggest', 'refactor', 'validate', 'generate', 'test'],
                        description: 'Type of operation'
                      },
                      name: {
                        type: 'string',
                        description: 'Name of the operation'
                      },
                      description: {
                        type: 'string',
                        description: 'Description of what the operation does'
                      },
                      input: {
                        type: 'object',
                        description: 'Input parameters for the operation'
                      },
                      dependencies: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Names of operations this depends on'
                      },
                      priority: {
                        type: 'number',
                        description: 'Priority of the operation (higher = more important)'
                      },
                      estimatedTime: {
                        type: 'number',
                        description: 'Estimated execution time in milliseconds'
                      }
                    },
                    required: ['type', 'name', 'description', 'input', 'dependencies', 'priority', 'estimatedTime']
                  }
                }
              },
              required: ['name', 'operations']
            }
          },
          {
            name: 'execute_workflow',
            description: 'Execute a created workflow with optional context',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'ID of the workflow to execute'
                },
                contextFilePath: {
                  type: 'string',
                  description: 'Optional file path to analyze for context'
                },
                contextPosition: {
                  type: 'object',
                  properties: {
                    line: { type: 'number' },
                    column: { type: 'number' }
                  },
                  description: 'Optional position in file for context analysis'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'get_workflow_status',
            description: 'Get the current status of a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'ID of the workflow to check'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'list_workflows',
            description: 'List all workflows and their statuses',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'cancel_workflow',
            description: 'Cancel a running workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'ID of the workflow to cancel'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'execute_single_operation',
            description: 'Execute a single operation without creating a full workflow',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['analyze', 'suggest', 'refactor', 'validate', 'generate', 'test']
                    },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    input: { type: 'object' },
                    dependencies: { type: 'array', items: { type: 'string' } },
                    priority: { type: 'number' },
                    estimatedTime: { type: 'number' }
                  },
                  required: ['type', 'name', 'description', 'input', 'dependencies', 'priority', 'estimatedTime']
                },
                contextFilePath: { type: 'string' },
                contextPosition: {
                  type: 'object',
                  properties: {
                    line: { type: 'number' },
                    column: { type: 'number' }
                  }
                }
              },
              required: ['operation']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_workflow':
            return await this.handleCreateWorkflow(args);
          
          case 'execute_workflow':
            return await this.handleExecuteWorkflow(args);
          
          case 'get_workflow_status':
            return await this.handleGetWorkflowStatus(args);
          
          case 'list_workflows':
            return await this.handleListWorkflows(args);
          
          case 'cancel_workflow':
            return await this.handleCancelWorkflow(args);
          
          case 'execute_single_operation':
            return await this.handleExecuteSingleOperation(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleCreateWorkflow(args) {
    const { name, operations } = args;
    
    try {
      const workflowId = await this.mcpManager.createWorkflow(name, operations);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                workflowId,
                name,
                operationsCount: operations.length,
                status: 'created'
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }

  async handleExecuteWorkflow(args) {
    const { workflowId, contextFilePath, contextPosition } = args;
    
    try {
      let context = null;
      
      // Analyze context if file path and position provided
      if (contextFilePath && contextPosition) {
        context = await this.contextManager.analyzeContext(contextFilePath, contextPosition);
      }
      
      const results = await this.mcpManager.executeWorkflow(workflowId, context);
      const workflow = this.mcpManager.getWorkflow(workflowId);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                workflowId,
                status: workflow?.status,
                executionTime: workflow?.totalTime,
                operationsExecuted: results.length,
                results: results.map(result => ({
                  operationId: result.operationId,
                  success: result.success,
                  executionTime: result.executionTime,
                  error: result.error,
                  dataKeys: result.data ? Object.keys(result.data) : []
                })),
                contextUsed: context ? {
                  function: context.currentFunction.functionName,
                  file: context.currentFile.filePath,
                  patterns: context.architecturePatterns.patterns
                } : null
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to execute workflow: ${error.message}`);
    }
  }

  async handleGetWorkflowStatus(args) {
    const { workflowId } = args;
    
    try {
      const workflow = this.mcpManager.getWorkflow(workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                id: workflow.id,
                name: workflow.name,
                status: workflow.status,
                currentOperationIndex: workflow.currentOperationIndex,
                totalOperations: workflow.operations.length,
                startTime: workflow.startTime,
                endTime: workflow.endTime,
                totalTime: workflow.totalTime,
                operations: workflow.operations.map(op => ({
                  id: op.id,
                  name: op.name,
                  type: op.type,
                  status: op.status,
                  error: op.error,
                  priority: op.priority,
                  estimatedTime: op.estimatedTime
                })),
                results: workflow.results.length
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get workflow status: ${error.message}`);
    }
  }

  async handleListWorkflows(args) {
    try {
      const workflows = this.mcpManager.getAllWorkflows();
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                count: workflows.length,
                workflows: workflows.map(workflow => ({
                  id: workflow.id,
                  name: workflow.name,
                  status: workflow.status,
                  operationsCount: workflow.operations.length,
                  currentOperation: workflow.currentOperationIndex,
                  createdAt: workflow.startTime,
                  completedAt: workflow.endTime,
                  totalTime: workflow.totalTime
                }))
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to list workflows: ${error.message}`);
    }
  }

  async handleCancelWorkflow(args) {
    const { workflowId } = args;
    
    try {
      this.mcpManager.cancelWorkflow(workflowId);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                workflowId,
                status: 'cancelled',
                message: 'Workflow has been cancelled'
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to cancel workflow: ${error.message}`);
    }
  }

  async handleExecuteSingleOperation(args) {
    const { operation, contextFilePath, contextPosition } = args;
    
    try {
      let context = null;
      
      // Analyze context if provided
      if (contextFilePath && contextPosition) {
        context = await this.contextManager.analyzeContext(contextFilePath, contextPosition);
      }
      
      // Create operation with ID and status
      const operationWithId = {
        ...operation,
        id: `single_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending'
      };
      
      const result = await this.mcpManager.executeOperation(operationWithId, context);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                operationId: result.operationId,
                operationType: operation.type,
                operationName: operation.name,
                success: result.success,
                executionTime: result.executionTime,
                error: result.error,
                result: result.data,
                contextUsed: context ? {
                  function: context.currentFunction.functionName,
                  file: context.currentFile.filePath,
                  patterns: context.architecturePatterns.patterns
                } : null
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to execute single operation: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Don't output to stderr as it interferes with MCP protocol
    // console.error('Sequential MCP server running on stdio');
  }
}

// Start the server
const server = new SequentialMCPServer();
server.run().catch(console.error);