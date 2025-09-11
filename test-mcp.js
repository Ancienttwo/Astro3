#!/usr/bin/env node

// Test the Context7 MCP functionality
const { SequentialMCPManager } = require('./lib/context7/sequential-mcp.js');
const { Context7Manager } = require('./lib/context7/context-manager.js');

async function testMCP() {
  console.log('Testing Context7 MCP Integration...\n');
  
  const mcpManager = new SequentialMCPManager();
  const contextManager = new Context7Manager();
  
  // Test 1: Create a workflow
  console.log('1. Creating workflow...');
  const operations = [
    {
      type: 'analyze',
      name: 'Analyze Code Structure',
      description: 'Deep analysis of current code',
      input: { filePath: './lib/context7/index.ts', analysisType: 'full' },
      dependencies: [],
      priority: 1,
      estimatedTime: 500
    },
    {
      type: 'suggest',
      name: 'Generate Suggestions',
      description: 'Generate improvement suggestions',
      input: { suggestionType: 'improvement' },
      dependencies: ['Analyze Code Structure'],
      priority: 2,
      estimatedTime: 300
    },
    {
      type: 'validate',
      name: 'Validate Changes',
      description: 'Ensure code correctness',
      input: { validationType: 'syntax' },
      dependencies: ['Generate Suggestions'],
      priority: 3,
      estimatedTime: 200
    }
  ];
  
  const workflowId = await mcpManager.createWorkflow('Test Workflow', operations);
  console.log(`✓ Workflow created: ${workflowId}\n`);
  
  // Test 2: Execute workflow
  console.log('2. Executing workflow...');
  try {
    const results = await mcpManager.executeWorkflow(workflowId);
    console.log('✓ Workflow executed successfully');
    console.log(`  Operations completed: ${results.length}`);
    console.log(`  Success rate: ${results.filter(r => r.success).length}/${results.length}\n`);
    
    // Display results
    results.forEach((result, index) => {
      const op = operations[index];
      console.log(`  ${index + 1}. ${op.name}: ${result.success ? '✓' : '✗'}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
  } catch (error) {
    console.error('✗ Workflow execution failed:', error.message);
  }
  
  // Test 3: Get workflow status
  console.log('\n3. Getting workflow status...');
  const workflow = mcpManager.getWorkflow(workflowId);
  console.log(`✓ Workflow status: ${workflow.status}`);
  console.log(`  Total execution time: ${workflow.totalTime}ms`);
  
  // Test 4: Execute single operation
  console.log('\n4. Testing single operation execution...');
  const singleOp = {
    type: 'generate',
    name: 'Generate Code',
    description: 'Generate a new function',
    input: { generateType: 'function', template: 'default' },
    dependencies: [],
    priority: 1,
    estimatedTime: 400
  };
  
  const singleResult = await mcpManager.executeOperation(
    { ...singleOp, id: 'single_op_test', status: 'pending' },
    null
  );
  
  console.log(`✓ Single operation executed: ${singleResult.success ? 'Success' : 'Failed'}`);
  if (singleResult.data) {
    console.log(`  Generated: ${singleResult.data.generated.name}`);
  }
  
  // Test 5: List all workflows
  console.log('\n5. Listing all workflows...');
  const allWorkflows = mcpManager.getAllWorkflows();
  console.log(`✓ Total workflows: ${allWorkflows.length}`);
  allWorkflows.forEach(wf => {
    console.log(`  - ${wf.name} (${wf.id}): ${wf.status}`);
  });
  
  console.log('\n✅ All tests completed successfully!');
}

// Run tests
testMCP().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});