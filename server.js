import express from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/profile-generator';

// MongoDB接続
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB接続成功'))
  .catch(err => console.error('MongoDB接続エラー:', err));

// ユーザーモデル
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// プロフィールモデル
const profileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  englishName: String,
  age: Number,
  occupation: String,
  company: String,
  location: String,
  bio: String,
  skills: [String],
  email: String,
  phone: String,
  website: String,
  image: String,
  originalImage: String, // アップロードされた名刺画像
  extractedText: String, // OCRで抽出されたテキスト
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  originalPage: String
});

const Profile = mongoose.model('Profile', profileSchema);

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 24 * 60 * 60 // 24時間
  }),
  cookie: {
    secure: false, // HTTPSの場合はtrue
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24時間
  }
}));

// 静的ファイル配信
app.use(express.static(__dirname));

// uploadsディレクトリを作成
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `namecard_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'アクセストークンが必要です' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無効なトークンです' });
    }
    req.user = user;
    next();
  });
};

// ユーザー登録
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ユーザーが既に存在するかチェック
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'ユーザーまたはメールアドレスが既に存在します' });
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcryptjs.hash(password, 12);

    // 新規ユーザー作成
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // トークン生成
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'ユーザー登録成功',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ユーザーログイン
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ユーザー検索
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(400).json({ error: 'ユーザーが見つかりません' });
    }

    // パスワード確認
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'パスワードが間違っています' });
    }

    // トークン生成
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'ログイン成功',
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ログアウト
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'ログアウトしました' });
});

// ユーザー情報取得
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// OCRテキスト抽出関数
async function extractTextFromImage(imagePath) {
  try {
    // 画像を前処理（コントラストとサイズ調整）
    const processedImageBuffer = await sharp(imagePath)
      .resize(1200, null, { withoutEnlargement: true })
      .normalize()
      .sharpen()
      .toBuffer();

    // Tesseractでテキスト抽出
    const { data: { text } } = await Tesseract.recognize(processedImageBuffer, 'jpn+eng', {
      logger: info => console.log('OCR進捗:', info)
    });

    return text.trim();
  } catch (error) {
    console.error('OCRエラー:', error);
    throw new Error('テキスト抽出に失敗しました');
  }
}

// 性別推定関数
function estimateGender(name) {
  if (!name) return 'unknown';
  
  // 男性を示唆する文字
  const maleIndicators = ['太郎', '一郎', '二郎', '三郎', '四郎', '五郎', '六郎', '七郎', '八郎', '九郎', '十郎', 
                         '光', '健', '誠', '洋', '博', '雄', '男', '夫', '彦', '介', '助', '朗', '輝', '大', '翔'];
  
  // 女性を示唆する文字
  const femaleIndicators = ['子', '美', '恵', '香', '奈', '菜', '花', '華', '愛', '彩', '咲', '千', '沙', '紗', 
                           '里', '理', '絵', '江', '代', '世', 'ちか', 'あやか', '由', '佳', '加', '麻'];
  
  // 男性チェック
  for (let indicator of maleIndicators) {
    if (name.includes(indicator)) return 'male';
  }
  
  // 女性チェック
  for (let indicator of femaleIndicators) {
    if (name.includes(indicator)) return 'female';
  }
  
  return 'unknown';
}

// サンプル画像URL生成
function generateSampleImage(name, gender = 'unknown') {
  const colors = ['667eea', '764ba2', '4CAF50', '2196F3', 'ff6b6b', 'ffa726'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  let icon = '👤';
  if (gender === 'male') {
    icon = '👨‍💼';
  } else if (gender === 'female') {
    icon = '👩‍💼';
  }
  
  return `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(icon + ' ' + (name || '名前不明'))}`;
}

// テキストからプロフィール情報抽出
function parseProfileFromText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const profile = {
    name: '',
    company: '',
    occupation: '',
    email: '',
    phone: '',
    website: '',
    location: ''
  };

  // 簡単な正規表現でパターンマッチング
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const phonePattern = /(\d{2,4}-\d{2,4}-\d{4}|\d{10,11})/;
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/;

  lines.forEach(line => {
    // メールアドレス
    const emailMatch = line.match(emailPattern);
    if (emailMatch && !profile.email) {
      profile.email = emailMatch[1];
      return;
    }

    // 電話番号
    const phoneMatch = line.match(phonePattern);
    if (phoneMatch && !profile.phone) {
      profile.phone = phoneMatch[1];
      return;
    }

    // ウェブサイト
    const urlMatch = line.match(urlPattern);
    if (urlMatch && !profile.website) {
      profile.website = urlMatch[1];
      return;
    }

    // 会社名（株式会社、有限会社などを含む行）
    if ((line.includes('株式会社') || line.includes('有限会社') || line.includes('合同会社') || 
         line.includes('Corporation') || line.includes('Inc.') || line.includes('Ltd.')) && !profile.company) {
      profile.company = line;
      return;
    }

    // 名前（最初の日本語文字列、会社名でない場合）
    if (!profile.name && /[ひらがなカタカナ漢字]/.test(line) && !line.includes('株式会社') && 
        !line.includes('有限会社') && !line.includes('合同会社')) {
      profile.name = line;
      return;
    }

    // 職業（役職っぽい単語を含む行）
    if ((line.includes('部長') || line.includes('課長') || line.includes('主任') || 
         line.includes('代表') || line.includes('社長') || line.includes('取締役') ||
         line.includes('マネージャー') || line.includes('エンジニア') || line.includes('ディレクター') ||
         line.includes('Manager') || line.includes('Director') || line.includes('CEO') || line.includes('CTO')) && !profile.occupation) {
      profile.occupation = line;
    }
  });

  return profile;
}

// 名刺アップロードとプロフィール生成
app.post('/api/upload-namecard', authenticateToken, upload.single('namecard'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像ファイルが必要です' });
    }

    console.log('画像アップロード開始:', req.file.filename);

    // OCRでテキスト抽出
    const extractedText = await extractTextFromImage(req.file.path);
    console.log('抽出されたテキスト:', extractedText);

    // テキストからプロフィール情報抽出
    const parsedProfile = parseProfileFromText(extractedText);
    console.log('解析されたプロフィール:', parsedProfile);

    // プロフィールIDを生成
    const profileId = `user_${Date.now()}`;

    // 性別を推定してサンプル画像を生成
    const gender = estimateGender(parsedProfile.name);
    const sampleImage = generateSampleImage(parsedProfile.name, gender);

    // MongoDBに保存
    const profile = new Profile({
      id: profileId,
      name: parsedProfile.name || '名前不明',
      occupation: parsedProfile.occupation || '',
      company: parsedProfile.company || '',
      email: parsedProfile.email || '',
      phone: parsedProfile.phone || '',
      website: parsedProfile.website || '',
      location: parsedProfile.location || '',
      bio: `${parsedProfile.company ? parsedProfile.company + 'の' : ''}${parsedProfile.occupation || '専門職'}として活動中。`,
      originalImage: req.file.filename,
      extractedText: extractedText,
      uploadedBy: req.user.userId,
      image: sampleImage, // 性別に応じたサンプル画像を使用
      skills: [] // 後から管理画面で編集可能
    });

    await profile.save();

    res.json({
      message: 'プロフィール生成成功',
      profile: {
        id: profile.id,
        name: profile.name,
        occupation: profile.occupation,
        company: profile.company,
        extractedText: profile.extractedText
      }
    });
  } catch (error) {
    console.error('名刺処理エラー:', error);
    res.status(500).json({ error: error.message || 'プロフィール生成に失敗しました' });
  }
});

// 全プロフィール取得（承認済みのみ）
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find({ isApproved: true })
      .populate('uploadedBy', 'username')
      .sort({ uploadedAt: -1 });
    
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// 自分がアップロードしたプロフィール取得
app.get('/api/my-profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await Profile.find({ uploadedBy: req.user.userId })
      .sort({ uploadedAt: -1 });
    
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// プロフィール承認（管理者のみ）
app.patch('/api/profiles/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    const profile = await Profile.findOneAndUpdate(
      { id: req.params.id },
      { isApproved: true },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'プロフィールが見つかりません' });
    }

    res.json({ message: 'プロフィールを承認しました', profile });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// アップロードされたファイルの配信
app.use('/uploads', express.static(uploadsDir));

// HTMLページのルーティング
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload-auth.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log('📊 MongoDB接続URI:', MONGODB_URI);
});