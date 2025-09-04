import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// JSONファイルのパス
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

// データディレクトリを作成
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// 初期データファイルを作成
function initializeDataFiles() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    }
    
    if (!fs.existsSync(EVENTS_FILE)) {
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
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(defaultEvents));
    }
    
    if (!fs.existsSync(PROFILES_FILE)) {
        fs.writeFileSync(PROFILES_FILE, JSON.stringify([]));
    }
}

initializeDataFiles();

// ミドルウェア
app.use(express.json());
app.use(express.static('.'));

// CORS設定
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// API エンドポイント
// イベント取得
app.get('/api/events', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'イベント取得エラー' });
    }
});

// イベント保存
app.post('/api/events', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        events.push(req.body);
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'イベント保存エラー' });
    }
});

// プロフィール取得
app.get('/api/profiles', (req, res) => {
    try {
        const profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'プロフィール取得エラー' });
    }
});

// プロフィール保存
app.post('/api/profiles', (req, res) => {
    try {
        const profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
        profiles.push(req.body);
        fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'プロフィール保存エラー' });
    }
});

// ユーザー取得
app.get('/api/users', (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'ユーザー取得エラー' });
    }
});

// ユーザー保存
app.post('/api/users', (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        Object.assign(users, req.body);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'ユーザー保存エラー' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 APIサーバーが起動しました: http://localhost:${PORT}`);
    console.log(`📁 データ保存先: ${DATA_DIR}`);
});