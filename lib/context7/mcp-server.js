#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const path = require('path');

// Import our Context7 implementation
const { Context7Manager } = require('./context-manager.js');

class Context7MCPServer {
  constructor() {
    this.contextManager = new Context7Manager();
    this.server = new Server(
      {
        name: 'context7-server',
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
            name: 'analyze_context',
            description: 'Analyze code context at 7 levels deep for enhanced understanding',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the file to analyze'
                },
                position: {
                  type: 'object',
                  properties: {
                    line: { type: 'number', description: 'Line number (1-based)' },
                    column: { type: 'number', description: 'Column number (0-based)' }
                  },
                  required: ['line', 'column']
                }
              },
              required: ['filePath', 'position']
            }
          },
          {
            name: 'generate_suggestions',
            description: 'Generate intelligent suggestions based on context analysis',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the file to analyze'
                },
                position: {
                  type: 'object',
                  properties: {
                    line: { type: 'number' },
                    column: { type: 'number' }
                  },
                  required: ['line', 'column']
                }
              },
              required: ['filePath', 'position']
            }
          },
          {
            name: 'get_context_info',
            description: 'Get detailed context information for debugging and analysis',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the file to analyze'
                },
                position: {
                  type: 'object',
                  properties: {
                    line: { type: 'number' },
                    column: { type: 'number' }
                  },
                  required: ['line', 'column']
                }
              },
              required: ['filePath', 'position']
            }
          },
          {
            name: 'clear_context_cache',
            description: 'Clear the context analysis cache',
            inputSchema: {
              type: 'object',
              properties: {}
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
          case 'analyze_context':
            return await this.handleAnalyzeContext(args);
          
          case 'generate_suggestions':
            return await this.handleGenerateSuggestions(args);
          
          case 'get_context_info':
            return await this.handleGetContextInfo(args);
          
          case 'clear_context_cache':
            return await this.handleClearCache(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleAnalyzeContext(args) {
    const { filePath, position } = args;
    
    try {
      const context = await this.contextManager.analyzeContext(filePath, position);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                contextDepth: context.contextDepth,
                currentFunction: {
                  name: context.currentFunction.functionName,
                  startLine: context.currentFunction.startLine,
                  endLine: context.currentFunction.endLine,
                  type: context.currentFunction.type
                },
                fileInfo: {
                  path: context.currentFile.filePath,
                  type: context.currentFile.fileType,
                  importsCount: context.currentFile.imports.length,
                  exportsCount: context.currentFile.exports.length
                },
                patterns: context.architecturePatterns.patterns,
                frameworks: context.architecturePatterns.frameworks,
                codeStyle: {
                  indentation: context.codeStyle.indentation,
                  quotes: context.codeStyle.quotes,
                  semicolons: context.codeStyle.semicolons
                },
                dependencies: context.libraryUsage.libraries.map(lib => lib.name),
                timestamp: context.timestamp
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  async handleGenerateSuggestions(args) {
    const { filePath, position } = args;
    
    try {
      const context = await this.contextManager.analyzeContext(filePath, position);
      const suggestions = await this.contextManager.generateSuggestions(context);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                confidence: suggestions.confidence,
                suggestions: suggestions.suggestions,
                warnings: suggestions.warnings,
                optimizations: suggestions.optimizations,
                patterns: suggestions.patterns,
                contextUsed: {
                  function: context.currentFunction.functionName,
                  patterns: context.architecturePatterns.patterns,
                  style: context.codeStyle.indentation
                }
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  async handleGetContextInfo(args) {
    const { filePath, position } = args;
    
    try {
      const context = await this.contextManager.analyzeContext(filePath, position);
      
      // Create a detailed context report
      const contextReport = {
        summary: {
          file: path.basename(filePath),
          function: context.currentFunction.functionName || 'Unknown',
          contextDepth: context.contextDepth,
          analysisTime: context.timestamp
        },
        levels: {
          level1_function: {
            name: context.currentFunction.functionName,
            lines: `${context.currentFunction.startLine}-${context.currentFunction.endLine}`,
            type: context.currentFunction.type,
            contentLength: context.currentFunction.content.length
          },
          level2_file: {
            path: context.currentFile.filePath,
            type: context.currentFile.fileType,
            imports: context.currentFile.imports.length,
            exports: context.currentFile.exports.length,
            lastModified: context.currentFile.lastModified
          },
          level3_module: {
            name: context.moduleContext.name,
            type: context.moduleContext.type,
            dependencies: context.moduleContext.dependencies.length,
            devDependencies: context.moduleContext.devDependencies.length
          },
          level4_architecture: {
            patterns: context.architecturePatterns.patterns,
            frameworks: context.architecturePatterns.frameworks,
            principles: context.architecturePatterns.designPrinciples,
            structure: context.architecturePatterns.codeStructure.organizationPattern
          },
          level5_style: {
            indentation: `${context.codeStyle.indentation}${context.codeStyle.spacesCount ? ` (${context.codeStyle.spacesCount})` : ''}`,
            quotes: context.codeStyle.quotes,
            semicolons: context.codeStyle.semicolons,
            maxLineLength: context.codeStyle.maxLineLength,
            namingConventions: context.codeStyle.namingConventions
          },
          level6_history: {
            frequentModifications: context.codeEvolution.frequentModifications.length,
            commonRefactorings: context.codeEvolution.commonRefactorings.length,
            bugPatterns: context.codeEvolution.bugPatterns.length,
            optimizations: context.codeEvolution.performanceOptimizations.length
          },
          level7_dependencies: {
            libraries: context.libraryUsage.libraries.length,
            apis: context.libraryUsage.apis.length,
            services: context.libraryUsage.services.length,
            libraryNames: context.libraryUsage.libraries.map(lib => lib.name)
          }
        }
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: contextReport
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  async handleClearCache(args) {
    try {
      this.contextManager.clearCache();
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Context cache cleared successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Context7 MCP server running on stdio');
  }
}

// Start the server
const server = new Context7MCPServer();
server.run().catch(console.error);