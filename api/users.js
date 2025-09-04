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
      // ユーザー取得
      const users = await db.collection('users').find({}).toArray();
      
      // オブジェクト形式に変換（email -> userDataの形式）
      const usersObj = {};
      users.forEach(user => {
        usersObj[user.email] = user;
      });
      
      return res.json(usersObj);
    }
    
    if (req.method === 'POST') {
      // ユーザー作成/更新
      const userData = req.body;
      
      // 複数ユーザーの場合（オブジェクト形式）
      if (typeof userData === 'object' && !userData.email) {
        for (const [email, userInfo] of Object.entries(userData)) {
          await db.collection('users').updateOne(
            { email },
            { $set: { ...userInfo, email } },
            { upsert: true }
          );
        }
      } else {
        // 単一ユーザーの場合
        await db.collection('users').updateOne(
          { email: userData.email },
          { $set: userData },
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