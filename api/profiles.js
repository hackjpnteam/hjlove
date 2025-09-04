import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('profile-generator');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      // プロフィール取得
      const profiles = await db.collection('profiles').find({}).toArray();
      return res.json(profiles);
    }
    
    if (req.method === 'POST') {
      // プロフィール作成/更新
      const profileData = req.body;
      
      if (profileData.id) {
        await db.collection('profiles').updateOne(
          { id: profileData.id },
          { $set: profileData },
          { upsert: true }
        );
      } else {
        profileData.id = 'profile' + Date.now();
        profileData.createdAt = new Date().toISOString();
        await db.collection('profiles').insertOne(profileData);
      }
      
      return res.json({ success: true, profile: profileData });
    }
    
    if (req.method === 'PUT') {
      // 全プロフィールデータ更新
      const profiles = req.body;
      
      for (const profile of profiles) {
        await db.collection('profiles').updateOne(
          { id: profile.id },
          { $set: profile },
          { upsert: true }
        );
      }
      
      return res.json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API エラー:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}