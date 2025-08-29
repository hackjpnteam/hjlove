import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// 静的ファイル配信
app.use(express.static(__dirname));

// ルーティング
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 簡易サーバーが起動しました: http://localhost:${PORT}`);
  console.log('📝 MongoDB不要の静的バージョン');
});