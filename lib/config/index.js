// Configuration Management System
const { z } = require('zod');
require('dotenv').config({ path: '.env.local' });

// Database Configuration Schema
const DatabaseConfigSchema = z.object({
  url: z.string().url(),
  anonKey: z.string(),
  serviceRoleKey: z.string(),
  jwtSecret: z.string().optional(),
});

// AI Services Configuration Schema  
const AIConfigSchema = z.object({
  provider: z.enum(['openai', 'siliconflow', 'dify']).default('siliconflow'),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  model: z.string().optional(),
  timeout: z.number().positive().default(30000),
});

// Web3 Configuration Schema
const Web3ConfigSchema = z.object({
  moralisApiKey: z.string(),
  walletConnectProjectId: z.string(),
  defaultChain: z.string().default('bsc'),
  contractAddresses: z.object({
    luckToken: z.string().optional(),
    nftContract: z.string().optional(),
  }).optional(),
});

// SMTP Configuration Schema
const SMTPConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().positive(),
  user: z.string(),
  pass: z.string(),
  from: z.string().email(),
  replyTo: z.string().email().optional(),
});

// Payment Configuration Schema
const PaymentConfigSchema = z.object({
  stripe: z.object({
    publishableKey: z.string(),
    secretKey: z.string(),
    webhookSecret: z.string(),
  }),
});

// Application Configuration Schema
const AppConfigSchema = z.object({
  env: z.enum(['development', 'production', 'test']).default('development'),
  url: z.string().url(),
  jwtSecret: z.string(),
  salt: z.string(),
  debug: z.boolean().default(false),
});

/**
 * Load and validate configuration from environment variables
 */
class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return {
        app: this.loadAppConfig(),
        database: this.loadDatabaseConfig(),
        ai: this.loadAIConfig(),
        web3: this.loadWeb3Config(),
        smtp: this.loadSMTPConfig(),
        payment: this.loadPaymentConfig(),
      };
    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      throw new Error(`Invalid configuration: ${error.message}`);
    }
  }

  loadAppConfig() {
    return AppConfigSchema.parse({
      env: process.env.NODE_ENV || 'development',
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      jwtSecret: process.env.JWT_SECRET,
      salt: process.env.NEXT_PUBLIC_SALT,
      debug: process.env.DEBUG === 'true',
    });
  }

  loadDatabaseConfig() {
    return DatabaseConfigSchema.parse({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: process.env.SUPABASE_JWT_SECRET,
    });
  }

  loadAIConfig() {
    const provider = process.env.AI_PROVIDER || 'siliconflow';
    
    const baseConfig = {
      provider,
      timeout: parseInt(process.env.AI_TIMEOUT_MS) || 30000,
    };

    switch (provider) {
      case 'siliconflow':
        return AIConfigSchema.parse({
          ...baseConfig,
          apiKey: process.env.SILICONFLOW_API_KEY,
          baseUrl: process.env.SILICONFLOW_BASE_URL,
          model: process.env.SILICONFLOW_MODEL,
        });
      case 'openai':
        return AIConfigSchema.parse({
          ...baseConfig,
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4',
        });
      case 'dify':
        return AIConfigSchema.parse({
          ...baseConfig,
          apiKey: process.env.DIFY_API_KEY,
          baseUrl: process.env.DIFY_BASE_URL,
        });
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  loadWeb3Config() {
    return Web3ConfigSchema.parse({
      moralisApiKey: process.env.MORALIS_API_KEY,
      walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      defaultChain: process.env.DEFAULT_CHAIN || 'bsc',
      contractAddresses: {
        luckToken: process.env.LUCK_TOKEN_ADDRESS,
        nftContract: process.env.NFT_CONTRACT_ADDRESS,
      },
    });
  }

  loadSMTPConfig() {
    return SMTPConfigSchema.parse({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
      replyTo: process.env.SMTP_REPLY_TO,
    });
  }

  loadPaymentConfig() {
    return PaymentConfigSchema.parse({
      stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
    });
  }

  // Getters for easy access
  get app() { return this.config.app; }
  get database() { return this.config.database; }
  get ai() { return this.config.ai; }
  get web3() { return this.config.web3; }
  get smtp() { return this.config.smtp; }
  get payment() { return this.config.payment; }

  // Validation method
  validate() {
    const issues = [];
    
    // Check required configurations
    if (!this.database.url || !this.database.anonKey) {
      issues.push('Database configuration is incomplete');
    }
    
    if (!this.ai.apiKey) {
      issues.push(`AI provider '${this.ai.provider}' requires API key`);
    }
    
    if (!this.web3.moralisApiKey) {
      issues.push('Web3 configuration requires Moralis API key');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Singleton instance
let configManager = null;

function getConfig() {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  return configManager;
}

module.exports = {
  getConfig,
  ConfigManager,
  // Export schemas for testing
  DatabaseConfigSchema,
  AIConfigSchema,
  Web3ConfigSchema,
  SMTPConfigSchema,
  PaymentConfigSchema,
  AppConfigSchema,
};