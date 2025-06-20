import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('candidate_management');
    const historyCollection = db.collection('history');

    switch (req.method) {
      case 'GET':
        try {
          const history = await historyCollection
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();
          
          res.status(200).json({ 
            success: true, 
            history: history.map(entry => ({
              ...entry,
              id: entry._id?.toString()
            }))
          });
        } catch (error) {
          console.error('GET History Error:', error);
          res.status(500).json({ success: false, error: 'Failed to fetch history' });
        }
        break;

      case 'POST':
        try {
          const { action, candidateName, details } = req.body;
          
          if (!action || !candidateName) {
            res.status(400).json({ success: false, error: 'Action and candidate name are required' });
            return;
          }

          const historyEntry = {
            action,
            candidateName,
            details: details || '',
            timestamp: new Date(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString()
          };

          await historyCollection.insertOne(historyEntry);
          res.status(201).json({ 
            success: true, 
            message: 'History entry added successfully'
          });
        } catch (error) {
          console.error('POST History Error:', error);
          res.status(500).json({ success: false, error: 'Failed to add history entry' });
        }
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
}
