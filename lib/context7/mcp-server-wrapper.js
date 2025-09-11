#!/usr/bin/env node

/**
 * MCP Server Wrapper for Context7
 * This wrapper ensures proper startup and error handling for Claude Desktop
 */

const path = require('path');

// Set working directory to project root
process.chdir(path.join(__dirname, '../..'));

// Import and start the server
try {
  require('./sequential-mcp-server.js');
} catch (error) {
  // Log errors to stderr only when debugging
  if (process.env.DEBUG_MCP === 'true') {
    console.error('MCP Server Error:', error);
  }
  process.exit(1);
}