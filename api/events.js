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
      // イベント取得
      const events = await db.collection('events').find({}).toArray();
      
      // デフォルトイベントがない場合は追加
      if (events.length === 0) {
        const defaultEvents = [
          {
            id: 'event005',
            title: '8時だよ全員集合朝会',
            description: '毎日の朝のミーティングです。今日の予定や目標を共有しましょう。',
            date: '2025-09-04T08:00:00',
            location: 'オンライン（Zoom）',
            price: '無料',
            capacity: 50,
            participants: [],
            checkedInUsers: [],
            createdBy: 'admin@example.com',
            createdAt: '2025-09-04T07:00:00',
            category: 'meeting'
          },
          {
            id: 'event1756988138911',
            title: 'コミュニティイベント',
            description: 'みんなで交流しましょう！',
            date: '2025-09-05T19:00:00',
            location: '東京',
            price: '無料',
            capacity: 30,
            participants: ['tomura@hackjpn.com'],
            checkedInUsers: [],
            createdBy: 'tomura@hackjpn.com',
            createdAt: '2025-09-04T12:00:00',
            category: 'community'
          }
        ];
        
        await db.collection('events').insertMany(defaultEvents);
        return res.json(defaultEvents);
      }
      
      return res.json(events);
    }
    
    if (req.method === 'POST') {
      // イベント作成/更新
      const eventData = req.body;
      
      if (eventData.id) {
        // 既存イベント更新
        await db.collection('events').updateOne(
          { id: eventData.id },
          { $set: eventData },
          { upsert: true }
        );
      } else {
        // 新規イベント作成
        eventData.id = 'event' + Date.now();
        eventData.createdAt = new Date().toISOString();
        await db.collection('events').insertOne(eventData);
      }
      
      return res.json({ success: true, event: eventData });
    }
    
    if (req.method === 'PUT') {
      // 全イベントデータ更新（参加者情報など）
      const events = req.body;
      
      for (const event of events) {
        await db.collection('events').updateOne(
          { id: event.id },
          { $set: event },
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