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

// Initialize database tables
async function initializeTables() {
  const client = getPool();
  
  try {    // Create candidates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        candidate_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        position VARCHAR(255),
        experience VARCHAR(255),
        skills TEXT,
        status VARCHAR(100) DEFAULT 'pending',
        interview TIMESTAMP,
        interview_type VARCHAR(100),
        company VARCHAR(255),
        remarks TEXT,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to existing table if they don't exist
    await client.query(`
      ALTER TABLE candidates 
      ADD COLUMN IF NOT EXISTS interview TIMESTAMP,
      ADD COLUMN IF NOT EXISTS interview_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS remarks TEXT
    `);
    
    // Create history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action VARCHAR(100) NOT NULL,
        candidate VARCHAR(255),
        details TEXT,
        user_name VARCHAR(255) DEFAULT 'System'
      )
    `);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    throw error;
  }
}

// Netlify function handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  let client = null;
    try {
    console.log(`🚀 API Request: ${event.httpMethod} ${event.path}`);
    
    // Initialize tables on first request
    await initializeTables();
    
    const client = getPool();
    const method = event.httpMethod;
    let result;

    switch (method) {
      case 'GET':
        console.log('📋 Fetching all candidates...');
        result = await client.query('SELECT * FROM candidates ORDER BY date_added DESC');
        console.log(`✅ Found ${result.rows.length} candidates`);
          // Convert PostgreSQL result to frontend format
        const candidates = result.rows.map(row => ({
          id: row.candidate_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          position: row.position,
          experience: row.experience,
          skills: row.skills,
          status: row.status,
          interview: row.interview ? row.interview.toISOString() : null,
          interviewType: row.interview_type,
          company: row.company,
          remarks: row.remarks,
          dateAdded: row.date_added,
          lastUpdated: row.last_updated
        }));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(candidates)
        };      case 'POST':
        console.log('➕ Creating new candidate...');
        if (!event.body) {
          throw new Error('Request body is required');
        }
        
        const newCandidate = JSON.parse(event.body);
        const candidateId = Date.now().toString();
        
        console.log('📝 Candidate data:', newCandidate.name);
          // Insert new candidate
        await client.query(`
          INSERT INTO candidates (candidate_id, name, email, phone, position, experience, skills, status, interview, interview_type, company, remarks)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          candidateId,
          newCandidate.name,
          newCandidate.email,
          newCandidate.phone,
          newCandidate.position,
          newCandidate.experience,
          newCandidate.skills,
          newCandidate.status || 'pending',
          newCandidate.interview ? new Date(newCandidate.interview) : null,
          newCandidate.interviewType,
          newCandidate.company,
          newCandidate.remarks
        ]);
        
        console.log('✅ Candidate created successfully');        // Log to history with detailed information
        const newCandidateDetails = `${newCandidate.name} (${newCandidate.position || 'No position specified'}) - ${newCandidate.email || 'No email'}`;
        await client.query(`
          INSERT INTO history (action, candidate, details)
          VALUES ($1, $2, $3)
        `, ['created', newCandidate.name, `Created new candidate: ${newCandidateDetails}`]);
        
        // Prepare response data
        const responseData = {
          id: candidateId,
          ...newCandidate,
          dateAdded: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(responseData)
        };      case 'PUT':
        console.log('✏️ Updating candidate...');
        if (!event.body) {
          throw new Error('Request body is required');
        }
        
        const updateData = JSON.parse(event.body);
        const { id } = updateData;
        
        console.log('📝 Updating candidate ID:', id);
        
        // Get current candidate data to compare changes
        const currentResult = await client.query('SELECT * FROM candidates WHERE candidate_id = $1', [id]);
        const currentData = currentResult.rows[0];
        
        if (!currentData) {
          throw new Error('Candidate not found');
        }
          // Track what fields changed
        const changes = [];
        if (currentData.name !== updateData.name) changes.push(`Name: "${currentData.name}" → "${updateData.name}"`);
        if (currentData.email !== updateData.email) changes.push(`Email: "${currentData.email || 'None'}" → "${updateData.email || 'None'}"`);
        if (currentData.phone !== updateData.phone) changes.push(`Phone: "${currentData.phone || 'None'}" → "${updateData.phone || 'None'}"`);
        if (currentData.position !== updateData.position) changes.push(`Position: "${currentData.position || 'None'}" → "${updateData.position || 'None'}"`);
        if (currentData.experience !== updateData.experience) changes.push(`Experience: "${currentData.experience || 'None'}" → "${updateData.experience || 'None'}"`);
        if (currentData.skills !== updateData.skills) changes.push(`Skills: "${currentData.skills || 'None'}" → "${updateData.skills || 'None'}"`);
        if (currentData.status !== updateData.status) changes.push(`Status: "${currentData.status}" → "${updateData.status}"`);
        
        // Check interview-related changes
        const currentInterview = currentData.interview ? currentData.interview.toISOString() : null;
        const newInterview = updateData.interview || null;
        if (currentInterview !== newInterview) {
          changes.push(`Interview: "${currentInterview || 'None'}" → "${newInterview || 'None'}"`);
        }
        if (currentData.interview_type !== updateData.interviewType) {
          changes.push(`Interview Type: "${currentData.interview_type || 'None'}" → "${updateData.interviewType || 'None'}"`);
        }
        if (currentData.company !== updateData.company) {
          changes.push(`Company: "${currentData.company || 'None'}" → "${updateData.company || 'None'}"`);
        }
        if (currentData.remarks !== updateData.remarks) {
          changes.push(`Remarks: "${currentData.remarks || 'None'}" → "${updateData.remarks || 'None'}"`);
        }
        
        // Update candidate
        await client.query(`
          UPDATE candidates 
          SET name = $1, email = $2, phone = $3, position = $4, 
              experience = $5, skills = $6, status = $7, 
              interview = $8, interview_type = $9, company = $10, remarks = $11,
              last_updated = CURRENT_TIMESTAMP
          WHERE candidate_id = $12
        `, [
          updateData.name,
          updateData.email,
          updateData.phone,
          updateData.position,
          updateData.experience,
          updateData.skills,
          updateData.status,
          updateData.interview ? new Date(updateData.interview) : null,
          updateData.interviewType,
          updateData.company,
          updateData.remarks,
          id
        ]);
        
        console.log('✅ Candidate updated successfully');
        
        // Log to history with detailed changes
        const changeDetails = changes.length > 0 ? changes.join('; ') : 'No changes detected';
        await client.query(`
          INSERT INTO history (action, candidate, details)
          VALUES ($1, $2, $3)
        `, ['updated', updateData.name, changeDetails]);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };      case 'DELETE':
        console.log('🗑️ Deleting candidate...');
        const deleteId = event.queryStringParameters?.id;
        if (!deleteId) {
          throw new Error('Candidate ID is required');
        }
        
        console.log('🗑️ Deleting candidate ID:', deleteId);
          // Get candidate details before deleting for better history logging
        const candidateResult = await client.query('SELECT * FROM candidates WHERE candidate_id = $1', [deleteId]);
        const candidateData = candidateResult.rows[0];
        
        if (!candidateData) {
          throw new Error('Candidate not found');
        }
          const deletedCandidateDetails = `${candidateData.name} (${candidateData.position || 'No position'}) - ${candidateData.email || 'No email'}`;
        
        // Delete candidate
        await client.query('DELETE FROM candidates WHERE candidate_id = $1', [deleteId]);
        
        console.log('✅ Candidate deleted successfully');
        
        // Log to history with detailed information
        await client.query(`
          INSERT INTO history (action, candidate, details)
          VALUES ($1, $2, $3)
        `, ['deleted', candidateData.name, `Deleted candidate: ${deletedCandidateDetails}`]);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };      case 'PATCH':
        // Clear all data if action=clear
        if (event.queryStringParameters?.action === 'clear') {
          console.log('🧹 Clearing all data...');
          await client.query('DELETE FROM candidates');
          await client.query('DELETE FROM history');
          
          console.log('✅ All data cleared successfully');
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'All data cleared' })
          };
        }
        
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // More detailed error response
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
    };  } finally {
    // Connection pooling handles cleanup automatically
  }
};
