#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple TypeScript to JavaScript transpiler for our MCP servers
// This is a basic transpiler - for production, use proper TypeScript compiler

function transpileTypeScript(content) {
  return content
    // Remove type annotations
    .replace(/:\s*[A-Za-z_$][A-Za-z0-9_$<>\[\]|&\s]*(?=\s*[=,;)])/g, '')
    // Remove interface definitions
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
    // Remove type imports
    .replace(/import\s*\{\s*type\s+[^}]*\}\s*from\s*[^;]*;/g, '')
    // Remove generic type parameters
    .replace(/<[A-Za-z_$][A-Za-z0-9_$<>\[\]|&\s]*>/g, '')
    // Remove as type assertions
    .replace(/\s+as\s+[A-Za-z_$][A-Za-z0-9_$<>\[\]|&\s]*/g, '')
    // Convert export syntax
    .replace(/export\s*\{\s*([^}]*)\s*\}/g, 'module.exports = { $1 }')
    // Convert class exports
    .replace(/export\s+class\s+(\w+)/g, 'class $1')
    // Add module.exports for classes
    .replace(/(class\s+\w+[\s\S]*?)(?=\n\n|$)/g, '$1\n\nmodule.exports = { $1.name };')
    // Fix module.exports for multiple exports
    .replace(/module\.exports = \{ (.*?) \};[\s\S]*module\.exports = \{ (\w+) \};/g, 'module.exports = { $1, $2 };')
    // Remove empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n');
}

function buildMCPServers() {
  const sourceFiles = [
    'context-manager.ts',
    'sequential-mcp.ts'
  ];

  sourceFiles.forEach(sourceFile => {
    const sourcePath = path.join(__dirname, sourceFile);
    const targetPath = path.join(__dirname, sourceFile.replace('.ts', '.js'));

    if (fs.existsSync(sourcePath)) {
      console.log(`Transpiling ${sourceFile}...`);
      
      const content = fs.readFileSync(sourcePath, 'utf8');
      let jsContent = transpileTypeScript(content);
      
      // Specific fixes for our files
      if (sourceFile === 'context-manager.ts') {
        jsContent = jsContent.replace(
          'module.exports = { Context7Manager };',
          'module.exports = { Context7Manager };'
        );
        
        // Add proper exports at the end
        jsContent += '\n\nmodule.exports = { Context7Manager };';
      }
      
      if (sourceFile === 'sequential-mcp.ts') {
        // Add proper exports at the end
        jsContent += '\n\nmodule.exports = { SequentialMCPManager };';
      }
      
      fs.writeFileSync(targetPath, jsContent);
      console.log(`Generated ${targetPath}`);
    } else {
      console.warn(`Source file ${sourceFile} not found`);
    }
  });

  console.log('MCP servers built successfully!');
}

// Make executables
function makeExecutable() {
  const serverFiles = ['mcp-server.js', 'sequential-mcp-server.js'];
  
  serverFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      fs.chmodSync(filePath, '755');
      console.log(`Made ${file} executable`);
    }
  });
}

if (require.main === module) {
  buildMCPServers();
  makeExecutable();
}