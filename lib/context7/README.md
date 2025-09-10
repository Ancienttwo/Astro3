# Context 7 & Sequential MCP for Cursor IDE

This implementation provides advanced context analysis (Context 7) and sequential Model Context Protocol (MCP) capabilities for Cursor IDE, enabling more intelligent code completion, analysis, and automated workflows.

## Features

### Context 7 Analysis
- **7-Level Deep Context Understanding**: Analyzes code at multiple levels from immediate function to project architecture
- **Smart Code Suggestions**: Context-aware completions and recommendations
- **Pattern Recognition**: Identifies and leverages coding patterns across the project
- **Style Guide Inference**: Automatically detects and enforces project coding standards

### Sequential MCP Operations
- **Multi-Step Workflows**: Execute complex operations in sequence with context preservation
- **Intelligent Chaining**: Automatically determine optimal operation sequences
- **Error Recovery**: Handle failures gracefully with rollback capabilities
- **Progress Tracking**: Monitor workflow execution and performance

### Cursor IDE Integration
- **Native Completions**: Enhanced autocompletion with context awareness
- **Smart Diagnostics**: Intelligent error detection and warnings
- **Automated Code Actions**: Quick fixes and refactoring suggestions
- **Hover Information**: Rich context information on hover

## Installation

```typescript
import { CursorContext7Integration } from './lib/context7';

const integration = new CursorContext7Integration({
  enableContext7: true,
  enableSequentialMCP: true,
  maxContextDepth: 7,
  debugMode: false
});
```

## Usage Examples

### Basic Context Analysis

```typescript
// Analyze current cursor position
const context = await integration.contextManager.analyzeContext(
  '/path/to/file.ts', 
  { line: 42, column: 10 }
);

console.log('Current function:', context.currentFunction.functionName);
console.log('Architecture patterns:', context.architecturePatterns.patterns);
console.log('Code style:', context.codeStyle);
```

### Sequential MCP Workflow

```typescript
// Create a refactoring workflow
const operations = [
  {
    type: 'analyze',
    name: 'Analyze Code Structure',
    description: 'Deep analysis of current code',
    input: { filePath: '/path/to/file.ts' },
    dependencies: [],
    priority: 1,
    estimatedTime: 500
  },
  {
    type: 'refactor',
    name: 'Extract Functions',
    description: 'Break down large functions',
    input: { refactorType: 'extract-function' },
    dependencies: ['Analyze Code Structure'],
    priority: 2,
    estimatedTime: 1000
  },
  {
    type: 'validate',
    name: 'Validate Changes',
    description: 'Ensure code correctness',
    input: { validationType: 'syntax' },
    dependencies: ['Extract Functions'],
    priority: 3,
    estimatedTime: 300
  }
];

const workflowId = await integration.mcpManager.createWorkflow('Refactor Large Function', operations);
const results = await integration.mcpManager.executeWorkflow(workflowId, context);
```

### Cursor IDE Integration

```typescript
// Provide intelligent completions
const completions = await integration.provideCompletions({
  line: 42,
  column: 10,
  filePath: '/path/to/file.ts'
}, '.');

// Generate diagnostics
const diagnostics = await integration.provideDiagnostics('/path/to/file.ts');

// Provide code actions
const actions = await integration.provideCodeActions(position, diagnostics);
```

## Context 7 Levels Explained

1. **Level 1 - Current Function**: Immediate function context and local variables
2. **Level 2 - File Context**: Imports, exports, and file-level scope
3. **Level 3 - Module Context**: Package dependencies and module structure
4. **Level 4 - Architecture Patterns**: Project architecture and design patterns
5. **Level 5 - Code Style**: Coding conventions and style guide
6. **Level 6 - Historical Patterns**: Code evolution and common modifications
7. **Level 7 - External Dependencies**: Library usage patterns and API integrations

## Sequential MCP Operations

### Available Operation Types

- **analyze**: Deep code analysis with context awareness
- **suggest**: Generate intelligent suggestions based on context
- **refactor**: Automated code refactoring with multiple strategies
- **validate**: Code validation (syntax, style, logic)
- **generate**: Code generation (functions, components, tests)
- **test**: Automated testing and coverage analysis

### Custom Operation Handlers

```typescript
// Register custom operation handler
integration.mcpManager.registerHandler('custom', async (operation, context) => {
  // Custom logic here
  return {
    operationId: operation.id,
    success: true,
    data: { result: 'custom operation completed' },
    executionTime: 100
  };
});
```

## Configuration Options

```typescript
interface CursorIntegrationConfig {
  enableContext7: boolean;          // Enable Context 7 analysis
  enableSequentialMCP: boolean;     // Enable Sequential MCP workflows
  maxContextDepth: number;          // Maximum context analysis depth
  cacheTimeout: number;             // Context cache timeout (ms)
  debugMode: boolean;               // Enable debug logging
}
```

## Error Handling

The system includes comprehensive error handling:

- **Graceful Degradation**: Falls back to basic functionality if advanced features fail
- **Operation Recovery**: Automatic retry and recovery for failed operations
- **Context Preservation**: Maintains context even when individual operations fail
- **Debug Information**: Detailed error reporting in debug mode

## Performance Considerations

- **Context Caching**: Intelligent caching prevents redundant analysis
- **Concurrent Operations**: Parallel execution of independent operations
- **Resource Limits**: Configurable limits on concurrent operations
- **Timeout Management**: Prevents hanging operations with configurable timeouts

## Testing

Run the comprehensive test suite:

```bash
npm test lib/context7/__tests__/context7.test.ts
```

The test suite covers:
- Context analysis accuracy
- MCP workflow execution
- Error handling and recovery
- Integration with Cursor IDE APIs
- Performance and caching behavior

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility

## License

This implementation is part of the larger project and follows the same licensing terms.

---

*Context 7 & Sequential MCP - Bringing advanced AI-powered development assistance to Cursor IDE*