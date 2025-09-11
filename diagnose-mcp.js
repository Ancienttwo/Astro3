#!/usr/bin/env node

/**
 * MCP Diagnostics Script
 * Checks the health and configuration of Context7 MCP
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 Context7 MCP Diagnostics');
console.log('============================\n');

// Check 1: Node version
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
console.log(`   ✅ Node.js ${nodeVersion} detected`);
if (parseInt(nodeVersion.split('.')[0].substring(1)) < 18) {
  console.log('   ⚠️  Warning: Node.js 18+ recommended');
}

// Check 2: MCP SDK installation
console.log('\n2. Checking MCP SDK installation...');
try {
  require.resolve('@modelcontextprotocol/sdk');
  console.log('   ✅ @modelcontextprotocol/sdk is installed');
} catch (e) {
  console.log('   ❌ @modelcontextprotocol/sdk not found');
  console.log('   Run: npm install @modelcontextprotocol/sdk');
}

// Check 3: Server files exist
console.log('\n3. Checking server files...');
const serverFiles = [
  'lib/context7/sequential-mcp-server.js',
  'lib/context7/sequential-mcp.js',
  'lib/context7/context-manager.js',
  'lib/context7/mcp-server-wrapper.js'
];

serverFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Check 4: Claude Desktop configuration
console.log('\n4. Checking Claude Desktop configuration...');
const configPath = path.join(
  process.env.HOME,
  'Library/Application Support/Claude/claude_desktop_config.json'
);

if (fs.existsSync(configPath)) {
  console.log('   ✅ Claude Desktop config file exists');
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (config.mcpServers && config.mcpServers.context7) {
    console.log('   ✅ context7 server is configured');
    console.log(`      Command: ${config.mcpServers.context7.command}`);
    console.log(`      Script: ${config.mcpServers.context7.args[0]}`);
  } else {
    console.log('   ❌ context7 server not configured');
  }
} else {
  console.log('   ❌ Claude Desktop config file not found');
}

// Check 5: Test server initialization
console.log('\n5. Testing server initialization...');
const testServer = spawn('node', [
  path.join(__dirname, 'lib/context7/mcp-server-wrapper.js')
]);

const initRequest = JSON.stringify({
  jsonrpc: "2.0",
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: {
      name: "diagnostic-test",
      version: "1.0.0"
    }
  },
  id: 1
});

testServer.stdin.write(initRequest + '\n');

let serverResponded = false;

testServer.stdout.on('data', (data) => {
  const response = data.toString();
  if (response.includes('"result"') && response.includes('"serverInfo"')) {
    console.log('   ✅ Server responds correctly to initialization');
    serverResponded = true;
  }
});

testServer.stderr.on('data', (data) => {
  console.log('   ⚠️  Server error output:', data.toString());
});

setTimeout(() => {
  testServer.kill();
  
  if (!serverResponded) {
    console.log('   ❌ Server did not respond to initialization');
  }
  
  // Check 6: Recent logs
  console.log('\n6. Checking recent logs...');
  const logPath = path.join(
    process.env.HOME,
    'Library/Logs/Claude/mcp-server-context7.log'
  );
  
  if (fs.existsSync(logPath)) {
    console.log('   ✅ Log file exists:', logPath);
    const stats = fs.statSync(logPath);
    const lastModified = new Date(stats.mtime);
    console.log(`   Last modified: ${lastModified.toLocaleString()}`);
    
    // Read last few lines
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    const lastLines = lines.slice(-3);
    
    if (lastLines.some(line => line.includes('error'))) {
      console.log('   ⚠️  Recent errors found in log');
    } else if (lastLines.some(line => line.includes('Server started and connected successfully'))) {
      console.log('   ✅ Server connected successfully in recent session');
    }
  } else {
    console.log('   ⚠️  Log file not found');
  }
  
  // Summary
  console.log('\n=============================');
  console.log('📋 Diagnostic Summary:');
  console.log('=============================');
  console.log('\n💡 Next steps:');
  console.log('1. Restart Claude Desktop to apply configuration changes');
  console.log('2. Check the /mcp command in Claude to see if context7 appears');
  console.log('3. If issues persist, check logs at:');
  console.log('   ~/Library/Logs/Claude/mcp-server-context7.log');
  console.log('\n✨ To test manually: node test-mcp.js');
  
}, 1000);