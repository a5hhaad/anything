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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('candidate_management');
    const candidatesCollection = db.collection('candidates');

    switch (req.method) {
      case 'GET':
        try {
          const candidates = await candidatesCollection.find({}).toArray();
          res.status(200).json({ 
            success: true, 
            candidates: candidates.map(candidate => ({
              ...candidate,
              id: candidate._id?.toString()
            }))
          });
        } catch (error) {
          console.error('GET Error:', error);
          res.status(500).json({ success: false, error: 'Failed to fetch candidates' });
        }
        break;

      case 'POST':
        try {
          const { candidate } = req.body;
          
          if (!candidate) {
            res.status(400).json({ success: false, error: 'Candidate data is required' });
            return;
          }

          // Add timestamp
          const candidateWithTimestamp = {
            ...candidate,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await candidatesCollection.insertOne(candidateWithTimestamp);
          res.status(201).json({ 
            success: true, 
            id: result.insertedId.toString(),
            message: 'Candidate added successfully'
          });
        } catch (error) {
          console.error('POST Error:', error);
          res.status(500).json({ success: false, error: 'Failed to add candidate' });
        }
        break;

      case 'PUT':
        try {
          const { candidate } = req.body;
          
          if (!candidate || !candidate.id) {
            res.status(400).json({ success: false, error: 'Candidate ID is required' });
            return;
          }

          const candidateId = candidate.id;
          const updateData = { 
            ...candidate, 
            updatedAt: new Date() 
          };
          delete updateData.id; // Remove id from update data

          const result = await candidatesCollection.updateOne(
            { _id: new MongoClient.ObjectId(candidateId) },
            { $set: updateData }
          );

          if (result.matchedCount === 0) {
            res.status(404).json({ success: false, error: 'Candidate not found' });
            return;
          }

          res.status(200).json({ 
            success: true, 
            message: 'Candidate updated successfully'
          });
        } catch (error) {
          console.error('PUT Error:', error);
          res.status(500).json({ success: false, error: 'Failed to update candidate' });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.query;
          
          if (!id) {
            res.status(400).json({ success: false, error: 'Candidate ID is required' });
            return;
          }

          const result = await candidatesCollection.deleteOne({ 
            _id: new MongoClient.ObjectId(id) 
          });

          if (result.deletedCount === 0) {
            res.status(404).json({ success: false, error: 'Candidate not found' });
            return;
          }

          res.status(200).json({ 
            success: true, 
            message: 'Candidate deleted successfully'
          });
        } catch (error) {
          console.error('DELETE Error:', error);
          res.status(500).json({ success: false, error: 'Failed to delete candidate' });
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
