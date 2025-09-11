#!/usr/bin/env node

/**
 * MCP CLI Wrapper for Context7
 * This script provides a command-line interface to interact with the Context7 MCP server
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Context7 MCP CLI - Interactive Mode');
console.log('=====================================');
console.log('Available commands:');
console.log('  list     - List available MCP servers');
console.log('  test     - Test Context7 MCP connection');
console.log('  tools    - List available tools');
console.log('  run      - Run a workflow');
console.log('  exit     - Exit the CLI');
console.log('');

function listServers() {
  console.log('\nConfigured MCP Servers:');
  console.log('1. context7 - Sequential MCP for code analysis and workflows');
  console.log('2. filesystem - File system operations');
  console.log('3. github - GitHub API operations');
  console.log('4. @magicuidesign/mcp - MagicUI components');
}

function testConnection() {
  console.log('\nTesting Context7 MCP connection...');
  
  const child = spawn('node', ['/Users/ancienttwo/Downloads/Astro3/lib/context7/sequential-mcp-server.js']);
  
  // Send initialization request
  const initRequest = JSON.stringify({
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "0.1.0",
      capabilities: {},
      clientInfo: {
        name: "mcp-cli",
        version: "1.0.0"
      }
    },
    id: 1
  });
  
  child.stdin.write(initRequest + '\n');
  
  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim() && !line.includes('server running')) {
        try {
          const response = JSON.parse(line);
          if (response.result) {
            console.log('✅ Connection successful!');
            console.log('Server:', response.result.serverInfo.name);
            console.log('Version:', response.result.serverInfo.version);
          }
        } catch (e) {
          // Ignore non-JSON output
        }
      }
    });
  });
  
  setTimeout(() => {
    child.kill();
    promptUser();
  }, 1000);
}

function listTools() {
  console.log('\nAvailable Context7 MCP Tools:');
  console.log('1. create_workflow - Create a new sequential workflow');
  console.log('2. execute_workflow - Execute a created workflow');
  console.log('3. get_workflow_status - Get workflow status');
  console.log('4. list_workflows - List all workflows');
  console.log('5. cancel_workflow - Cancel a running workflow');
  console.log('6. execute_single_operation - Execute a single operation');
}

function runWorkflow() {
  console.log('\nRunning test workflow...');
  require('./test-mcp.js');
}

function promptUser() {
  rl.question('\nmcp> ', (command) => {
    switch(command.trim().toLowerCase()) {
      case 'list':
        listServers();
        promptUser();
        break;
      case 'test':
        testConnection();
        break;
      case 'tools':
        listTools();
        promptUser();
        break;
      case 'run':
        runWorkflow();
        break;
      case 'exit':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Unknown command. Type "exit" to quit.');
        promptUser();
    }
  });
}

// Start the CLI
promptUser();