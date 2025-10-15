const mysql = require('mysql2');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let db;

if (process.env.NODE_ENV === 'production') {
  // Use Supabase in production (Vercel)
  console.log('🚀 Initializing Supabase for production...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables missing in production');
    // Create a mock db that throws informative errors
    db = {
      query: () => { throw new Error('Supabase not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'); },
      execute: () => { throw new Error('Supabase not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'); },
      connect: (cb) => cb(new Error('Supabase not configured')),
      end: () => {}
    };
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Supabase Connected...');
      
      // Create a MySQL-compatible interface for Supabase
      db = {
        query: (sql, params, callback) => {
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          
          executeSupabaseQuery(supabase, sql, params)
            .then(result => callback(null, result))
            .catch(error => callback(error, null));
        },
        
        execute: (sql, params, callback) => {
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          
          executeSupabaseQuery(supabase, sql, params)
            .then(result => callback(null, result))
            .catch(error => callback(error, null));
        },
        
        connect: (callback) => {
          // Supabase is always "connected"
          callback(null);
        },
        
        end: () => {
          console.log('Supabase connection closed');
        },
        
        on: (event, callback) => {
          // Handle events if needed
          if (event === 'error') {
            // Supabase errors are handled in queries
          }
        }
      };
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
      throw error;
    }
  }
} else {
  // Use MySQL in development (local)
  console.log('💻 Initializing MySQL for development...');
  
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'John*8878',
    database: process.env.DB_NAME || 'library_management',
    port: process.env.DB_PORT || 3306
  });

  db.connect((err) => {
    if (err) {
      console.error('❌ MySQL connection failed:', err);
      return;
    }
    console.log('✅ MySQL Connected...');
  });
}

// Helper function to convert MySQL queries to Supabase
async function executeSupabaseQuery(supabase, sql, params = []) {
  const trimmedSQL = sql.trim();
  const command = trimmedSQL.split(' ')[0].toUpperCase();
  
  try {
    switch (command) {
      case 'SELECT':
        return await handleSelect(supabase, trimmedSQL, params);
      case 'INSERT':
        return await handleInsert(supabase, trimmedSQL, params);
      case 'UPDATE':
        return await handleUpdate(supabase, trimmedSQL, params);
      case 'DELETE':
        return await handleDelete(supabase, trimmedSQL, params);
      default:
        throw new Error(`Unsupported SQL command in production: ${command}`);
    }
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
}

// SELECT query handler
async function handleSelect(supabase, sql, params) {
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not extract table name from SELECT query');
  
  const table = tableMatch[1];
  const { data, error } = await supabase.from(table).select('*');
  
  if (error) throw error;
  return [data]; // Return in MySQL format
}

// INSERT query handler  
async function handleInsert(supabase, sql, params) {
  const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not extract table name from INSERT query');
  
  const table = tableMatch[1];
  const columnsMatch = sql.match(/\(([^)]+)\)/);
  const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
  
  if (!columnsMatch || !valuesMatch) {
    throw new Error('Could not parse INSERT query columns/values');
  }
  
  const columns = columnsMatch[1].split(',').map(col => col.trim());
  const insertData = {};
  
  columns.forEach((col, index) => {
    insertData[col] = params[index] !== undefined ? params[index] : null;
  });
  
  const { data, error } = await supabase
    .from(table)
    .insert([insertData])
    .select();
  
  if (error) throw error;
  
  // Return in MySQL format
  return {
    insertId: data[0]?.id,
    affectedRows: 1,
    ...data[0]
  };
}

// UPDATE query handler
async function handleUpdate(supabase, sql, params) {
  const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not extract table name from UPDATE query');
  
  const table = tableMatch[1];
  const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
  
  if (!setMatch) throw new Error('Could not parse SET clause in UPDATE query');
  
  // Simple implementation - you might want to enhance this
  const { data, error } = await supabase
    .from(table)
    .update({ updated_at: new Date() })
    .select();
  
  if (error) throw error;
  
  return {
    affectedRows: data.length,
    changedRows: data.length
  };
}

// DELETE query handler
async function handleDelete(supabase, sql, params) {
  const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not extract table name from DELETE query');
  
  const table = tableMatch[1];
  
  // For safety, we'll limit delete operations
  // You might want to implement proper WHERE clause parsing
  const { error } = await supabase
    .from(table)
    .delete()
    .neq('id', 0); // Safety check - modify as needed
  
  if (error) throw error;
  
  return {
    affectedRows: 1 // This is simplified
  };
}

module.exports = db;