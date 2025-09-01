#!/usr/bin/env node

/**
 * Database Connection Tester
 * 
 * This script helps you test database connections for different environments:
 * - Local Supabase instance
 * - Production database
 * - Branch/Preview database
 * 
 * Usage:
 *   node scripts/test-db-connection.js [local|production|branch]
 * 
 * Examples:
 *   node scripts/test-db-connection.js branch
 *   npm run test:db:branch
 */

const postgres = require('postgres');
require('dotenv').config();

// Environment-specific configurations
const configs = {
  local: {
    name: 'Local Supabase',
    envFile: 'supabase-local.env',
    connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres'
  },
  production: {
    name: 'Production Database',
    envFile: '.env.local',
    getConnectionString: () => {
      require('dotenv').config({ path: '.env.local' });
      return process.env.DATABASE_URL;
    }
  },
  branch: {
    name: 'Branch/Preview Database',
    envFile: '.env.branch',
    getConnectionString: () => {
      require('dotenv').config({ path: '.env.branch' });
      const projectId = process.env.SUPABASE_PROJECT_ID;
      const password = process.env.DB_PASSWORD;
      
      if (!projectId || !password) {
        throw new Error('SUPABASE_PROJECT_ID and DB_PASSWORD must be set in .env.branch');
      }
      
      // Return multiple connection options to try
      return {
        direct: `postgresql://postgres:${password}@db.${projectId}.supabase.co:5432/postgres`,
        pooled: `postgresql://postgres:${password}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`,
        // URL-encoded version in case of special characters
        directEncoded: `postgresql://postgres:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres`
      };
    }
  }
};

async function testConnection(environment = 'branch') {
  const config = configs[environment];
  
  if (!config) {
    console.error('❌ Invalid environment. Use: local, production, or branch');
    process.exit(1);
  }

  console.log(`🔍 Testing ${config.name} connection...`);
  console.log(`📁 Using config: ${config.envFile}\n`);

  let connectionString;
  let connectionOptions;
  let sql;
  
  try {
    if (config.getConnectionString) {
      const result = config.getConnectionString();
      
      // Handle multiple connection options for branch
      if (typeof result === 'object' && result.direct) {
        connectionOptions = result;
        console.log('🔄 Multiple connection methods available for branch database:\n');
        console.log('   1. Direct connection (port 5432) - Best for persistent connections');
        console.log('   2. Pooled connection (port 6543) - Better for IPv4 compatibility');
        console.log('   3. URL-encoded - For special characters in password\n');
        
        // Try direct connection first
        const methods = [
          { name: 'Direct Connection', url: connectionOptions.direct },
          { name: 'Pooled Connection', url: connectionOptions.pooled },
          { name: 'Direct (URL-encoded)', url: connectionOptions.directEncoded }
        ];
        
        let connected = false;
        for (const method of methods) {
          try {
            console.log(`🔌 Trying ${method.name}...`);
            console.log(`🔗 Connection string: ${method.url.replace(/:[^:@]+@/, ':****@')}`);
            
            sql = postgres(method.url, {
              ssl: environment !== 'local' ? 'require' : false,
              max: 1,
              idle_timeout: 10,
              connect_timeout: 5
            });
            
            // Test the connection with a simple query
            await sql`SELECT 1 as test`;
            console.log(`✅ ${method.name} successful!\n`);
            connectionString = method.url;
            connected = true;
            break;
            
          } catch (error) {
            console.log(`❌ ${method.name} failed: ${error.message}`);
            if (sql) await sql.end();
            continue;
          }
        }
        
        if (!connected) {
          throw new Error('All connection methods failed');
        }
        
      } else {
        connectionString = result;
      }
    } else {
      connectionString = config.connectionString;
    }

    if (!connectionString && !connectionOptions) {
      throw new Error('Connection string is empty');
    }

    // If we haven't connected yet (non-branch environments)
    if (!sql) {
      console.log(`🔗 Connection string: ${connectionString.replace(/:[^:@]+@/, ':****@')}\n`);

      sql = postgres(connectionString, {
        ssl: environment !== 'local' ? 'require' : false,
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10
      });
    }

    console.log('🔌 Testing database connection...');
    
    // Test basic queries
    console.log('📊 Running test queries...\n');

    // Check PostgreSQL version
    const versionResult = await sql`SELECT version()`;
    console.log(`📦 PostgreSQL Version: ${versionResult[0].version.split(',')[0]}`);

    // Check current database
    const dbResult = await sql`SELECT current_database()`;
    console.log(`🗄️  Current Database: ${dbResult[0].current_database}`);

    // Check current user
    const userResult = await sql`SELECT current_user`;
    console.log(`👤 Current User: ${userResult[0].current_user}`);

    // List schemas
    const schemasResult = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `;
    console.log(`📂 Available Schemas: ${schemasResult.map(r => r.schema_name).join(', ')}`);

    // List migrations (if migrations table exists)
    try {
      // First, check what columns exist in the migrations table
      const migrationColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
        ORDER BY ordinal_position
      `;
      
      if (migrationColumns.length > 0) {
        console.log(`\n📋 Migration table columns: ${migrationColumns.map(c => c.column_name).join(', ')}`);
        
        // Try different column names that might exist
        let migrationsQuery;
        const columnNames = migrationColumns.map(c => c.column_name);
        
        if (columnNames.includes('applied_at')) {
          migrationsQuery = sql`
            SELECT name, applied_at 
            FROM supabase_migrations.schema_migrations 
            ORDER BY applied_at DESC 
            LIMIT 5
          `;
        } else if (columnNames.includes('executed_at')) {
          migrationsQuery = sql`
            SELECT version as name, executed_at as applied_at
            FROM supabase_migrations.schema_migrations 
            ORDER BY executed_at DESC 
            LIMIT 5
          `;
        } else if (columnNames.includes('version')) {
          migrationsQuery = sql`
            SELECT version as name
            FROM supabase_migrations.schema_migrations 
            ORDER BY version DESC 
            LIMIT 5
          `;
        } else {
          migrationsQuery = sql`
            SELECT *
            FROM supabase_migrations.schema_migrations 
            LIMIT 5
          `;
        }
        
        const migrationsResult = await migrationsQuery;
        console.log(`\n📋 Recent Migrations (last 5):`);
        migrationsResult.forEach((row, index) => {
          if (row.applied_at) {
            console.log(`   ${index + 1}. ${row.name} (${new Date(row.applied_at).toISOString()})`);
          } else {
            console.log(`   ${index + 1}. ${row.name || row.version || JSON.stringify(row)}`);
          }
        });
      } else {
        console.log(`\n⚠️  No migration table found in supabase_migrations schema`);
      }
    } catch (migrationError) {
      console.log(`\n⚠️  Could not fetch migrations: ${migrationError.message}`);
    }

    // List tables in public schema
    try {
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      console.log(`\n📄 Public Tables (${tablesResult.length}):`);
      if (tablesResult.length > 0) {
        tablesResult.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.table_name}`);
        });
      } else {
        console.log('   No tables found in public schema');
      }
    } catch (tableError) {
      console.log(`\n⚠️  Could not fetch tables: ${tableError.message}`);
    }

    await sql.end();
    console.log('\n🎉 Database connection test completed successfully!');

  } catch (error) {
    console.error(`\n❌ Connection failed:`);
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Tip: Make sure the database server is running and accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   💡 Tip: Check the hostname in your connection string');
    } else if (error.message.includes('authentication failed')) {
      console.error('   💡 Tip: Check your username and password');
    } else if (error.message.includes('SSL')) {
      console.error('   💡 Tip: SSL connection issue - check your SSL settings');
    }
    
    console.error(`\n   Connection string (sanitized): ${connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'undefined'}`);
    
    if (sql) {
      await sql.end();
    }
    
    process.exit(1);
  }
}

// Get environment from command line argument
const environment = process.argv[2] || 'branch';

// Run the test
testConnection(environment);
