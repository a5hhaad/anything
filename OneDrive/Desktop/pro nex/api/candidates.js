const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('candidatedb');
    const collection = db.collection('candidates');

    if (req.method === 'GET') {
      // Get all candidates
      console.log('GET request - fetching candidates');
      const candidates = await collection.find({}).toArray();
      console.log(`Found ${candidates.length} candidates`);
      return res.status(200).json(candidates);
    }

    if (req.method === 'POST') {
      // Save candidates array (replace all)
      console.log('POST request - saving candidates');
      const candidates = req.body;
      
      if (!Array.isArray(candidates)) {
        console.error('Invalid data format - expected array');
        return res.status(400).json({ error: 'Expected array of candidates' });
      }

      // Clear existing candidates and insert new ones
      await collection.deleteMany({});
      console.log('Cleared existing candidates');
      
      if (candidates.length > 0) {
        await collection.insertMany(candidates);
        console.log(`Inserted ${candidates.length} candidates`);
      }
      
      return res.status(200).json({ 
        message: 'Candidates saved successfully', 
        count: candidates.length 
      });
    }

    // Method not allowed
    console.log(`Method ${req.method} not allowed`);
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
};
