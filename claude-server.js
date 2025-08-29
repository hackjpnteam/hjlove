import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// ES moduleでの__dirnameの取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数を読み込み
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Claude APIクライアントを初期化
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Claude API エンドポイント
app.post('/api/claude', async (req, res) => {
    try {
        const { message, systemPrompt } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'メッセージが必要です' });
        }

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 4000,
            system: systemPrompt || 'あなたは親切で知識豊富なAIアシスタントです。',
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        res.json({ 
            success: true, 
            response: response.content[0].text 
        });

    } catch (error) {
        console.error('Claude API エラー:', error);
        res.status(500).json({ 
            error: 'Claude APIの呼び出しに失敗しました',
            details: error.message 
        });
    }
});

// プロフィール生成用のClaude API エンドポイント
app.post('/api/generate-profile', async (req, res) => {
    try {
        const { profileData } = req.body;
        
        if (!profileData || !profileData.name || !profileData.bio) {
            return res.status(400).json({ error: 'プロフィールデータが不完全です' });
        }

        const systemPrompt = `
あなたはプロフェッショナルなプロフィール作成の専門家です。
提供された基本情報から、魅力的で詳細なプロフィール情報を生成してください。

以下の形式でJSONレスポンスを返してください：
{
    "enhancedBio": "より詳細で魅力的な自己紹介文",
    "suggestedSkills": ["追加推奨スキル1", "追加推奨スキル2"],
    "professionalSummary": "プロフェッショナルサマリー",
    "keyStrengths": ["強み1", "強み2", "強み3"]
}
`;

        const message = `
以下のプロフィール情報を分析し、改善提案を行ってください：

名前: ${profileData.name}
${profileData.age ? `年齢: ${profileData.age}歳` : ''}
職業: ${profileData.occupation}
${profileData.location ? `居住地: ${profileData.location}` : ''}
自己紹介: ${profileData.bio}
${profileData.skills && profileData.skills.length > 0 ? `現在のスキル: ${profileData.skills.join(', ')}` : ''}
`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 2000,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        // JSONレスポンスをパース
        let enhancedProfile;
        try {
            enhancedProfile = JSON.parse(response.content[0].text);
        } catch (parseError) {
            // JSONパースに失敗した場合は、テキストレスポンスとして返す
            enhancedProfile = {
                enhancedBio: response.content[0].text,
                suggestedSkills: [],
                professionalSummary: "",
                keyStrengths: []
            };
        }

        res.json({ 
            success: true, 
            originalProfile: profileData,
            enhancedProfile: enhancedProfile
        });

    } catch (error) {
        console.error('プロフィール生成エラー:', error);
        res.status(500).json({ 
            error: 'プロフィール生成に失敗しました',
            details: error.message 
        });
    }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Claude API サーバーが稼働中です',
        timestamp: new Date().toISOString()
    });
});

// サーバー起動
app.listen(port, () => {
    console.log(`🚀 Claude API サーバーが起動しました: http://localhost:${port}`);
    console.log(`🤖 Claude API Key: ${process.env.CLAUDE_API_KEY ? '設定済み' : '未設定'}`);
    console.log(`📂 静的ファイル提供: ${__dirname}`);
});

export default app;