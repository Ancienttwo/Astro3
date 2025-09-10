// Database Service Layer - Repository Pattern Implementation
const { createClient } = require('@supabase/supabase-js');
const { getConfig } = require('../config');

class DatabaseService {
  constructor() {
    const config = getConfig();
    
    // Client for public operations (anon key)
    this.publicClient = createClient(
      config.database.url, 
      config.database.anonKey
    );
    
    // Client for admin operations (service role key)  
    this.adminClient = createClient(
      config.database.url,
      config.database.serviceRoleKey
    );
  }

  /**
   * Get appropriate client based on operation type
   */
  getClient(useAdmin = false) {
    return useAdmin ? this.adminClient : this.publicClient;
  }

  /**
   * Execute raw SQL with admin privileges
   */
  async executeSQL(query, params = []) {
    const { data, error } = await this.adminClient.rpc('exec_sql', {
      query,
      params
    });
    
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
    
    return data;
  }

  /**
   * Generic repository methods
   */
  async findById(table, id, useAdmin = false) {
    const client = this.getClient(useAdmin);
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is OK
      throw new Error(`Find by ID failed: ${error.message}`);
    }
    
    return data;
  }

  async findMany(table, filters = {}, options = {}, useAdmin = false) {
    const client = this.getClient(useAdmin);
    let query = client.from(table).select(options.select || '*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply options
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { 
        ascending: options.orderBy.ascending !== false 
      });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 25) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Find many failed: ${error.message}`);
    }
    
    return { data, count };
  }

  async create(table, data, useAdmin = false) {
    const client = this.getClient(useAdmin);
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Create failed: ${error.message}`);
    }
    
    return result;
  }

  async update(table, id, data, useAdmin = false) {
    const client = this.getClient(useAdmin);
    const { data: result, error } = await client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
    
    return result;
  }

  async delete(table, id, useAdmin = false) {
    const client = this.getClient(useAdmin);
    const { error } = await client
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
    
    return true;
  }

  async upsert(table, data, conflictColumns = ['id'], useAdmin = false) {
    const client = this.getClient(useAdmin);
    const { data: result, error } = await client
      .from(table)
      .upsert(data, { onConflict: conflictColumns.join(',') })
      .select();
    
    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }
    
    return result;
  }

  async count(table, filters = {}, useAdmin = false) {
    const client = this.getClient(useAdmin);
    let query = client.from(table).select('*', { count: 'exact', head: true });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Count failed: ${error.message}`);
    }
    
    return count;
  }

  /**
   * Transaction support
   */
  async transaction(operations, useAdmin = true) {
    const client = this.getClient(useAdmin);
    
    try {
      // Start transaction (if supported) or batch operations
      const results = [];
      
      for (const operation of operations) {
        const result = await operation(client);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const { data, error } = await this.publicClient
        .from('fortune_slips')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      return {
        healthy: !error,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
let databaseService = null;

function getDatabase() {
  if (!databaseService) {
    databaseService = new DatabaseService();
  }
  return databaseService;
}

module.exports = {
  getDatabase,
  DatabaseService
};