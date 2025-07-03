const { Pool } = require('pg');

let pool = null;

// Initialize PostgreSQL connection pool
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

// Netlify function handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log(`🚀 History API Request: ${event.httpMethod} ${event.path}`);
    
    const client = getPool();
    
    if (event.httpMethod === 'GET') {
      console.log('📋 Fetching history...');
      
      const result = await client.query(`
        SELECT * FROM history 
        ORDER BY timestamp DESC 
        LIMIT 100
      `);
      
      console.log(`✅ Found ${result.rows.length} history entries`);
      
      // Convert PostgreSQL result to match expected format
      const history = result.rows.map(row => ({
        timestamp: row.timestamp,
        action: row.action,
        candidate: row.candidate,
        details: row.details,
        user: row.user_name
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(history)
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  } catch (error) {
    console.error('❌ History API Error:', error);
    
    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    // Add more context for PostgreSQL errors
    if (error.code === 'ECONNREFUSED') {
      errorResponse.details = 'Database connection refused';
    } else if (error.code === 'ENOTFOUND') {
      errorResponse.details = 'Database host not found';
    } else if (error.message.includes('DATABASE_URL')) {
      errorResponse.details = 'Database URL environment variable not configured';
    } else if (error.code) {
      errorResponse.details = `Database error: ${error.code}`;
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};