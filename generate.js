import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'profiles.json'), 'utf-8'));

const indexTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>人物プロフィール一覧</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 40px;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .profiles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
        }
        .profile-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            text-decoration: none;
            color: inherit;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        .profile-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 15px;
        }
        .profile-name {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        .profile-english {
            display: block;
            font-size: 0.9rem;
            font-weight: normal;
            color: #888;
            margin-top: 5px;
        }
        .profile-age {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }
        .profile-occupation {
            color: #666;
            margin-bottom: 10px;
        }
        .profile-bio {
            color: #888;
            line-height: 1.6;
        }
        .add-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: #ff6b6b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        .add-button:hover {
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>人物プロフィール一覧</h1>
        <div class="profiles-grid">
            {{PROFILES}}
        </div>
    </div>
    <div class="add-button" onclick="alert('profiles.jsonに新しい人物データを追加して、npm run generateを実行してください')">+</div>
</body>
</html>`;

const profileTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{NAME}} - プロフィール</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .back-link {
            display: inline-block;
            margin-bottom: 30px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: opacity 0.3s ease;
        }
        .back-link:hover {
            opacity: 0.7;
        }
        .profile-header {
            display: flex;
            gap: 40px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        .profile-image {
            width: 250px;
            height: 250px;
            object-fit: cover;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .profile-info {
            flex: 1;
            min-width: 250px;
        }
        .profile-name {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .profile-meta {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #666;
        }
        .meta-label {
            font-weight: 600;
            min-width: 80px;
        }
        .profile-bio {
            color: #555;
            line-height: 1.8;
            font-size: 1.1rem;
        }
        .skills-section {
            margin-top: 40px;
        }
        .section-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
        }
        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill-tag {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← 一覧に戻る</a>
        <div class="profile-header">
            <img src="{{IMAGE}}" alt="{{NAME}}" class="profile-image">
            <div class="profile-info">
                <h1 class="profile-name">{{NAME}}</h1>
                <div class="profile-meta">
                    <div class="meta-item">
                        <span class="meta-label">年齢:</span>
                        <span>{{AGE}}歳</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">職業:</span>
                        <span>{{OCCUPATION}}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">所在地:</span>
                        <span>{{LOCATION}}</span>
                    </div>
                </div>
                <p class="profile-bio">{{BIO}}</p>
            </div>
        </div>
        {{SKILLS_SECTION}}
    </div>
</body>
</html>`;

function generateProfileCard(profile) {
    const profileLink = profile.originalPage || `${profile.id}.html`;
    const englishName = profile.englishName ? `<span class="profile-english">${profile.englishName}</span>` : '';
    const age = profile.age ? `${profile.age}歳` : '';
    
    return `
        <a href="${profileLink}" class="profile-card">
            <img src="${profile.image}" alt="${profile.name}" class="profile-image">
            <div class="profile-name">${profile.name}${englishName}</div>
            ${age ? `<div class="profile-age">${age}</div>` : ''}
            <div class="profile-occupation">${profile.occupation}</div>
            <div class="profile-bio">${profile.bio}</div>
        </a>
    `;
}

function generateSkillsSection(skills) {
    if (!skills || skills.length === 0) return '';
    
    const skillTags = skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
    return `
        <div class="skills-section">
            <h2 class="section-title">スキル</h2>
            <div class="skills-grid">
                ${skillTags}
            </div>
        </div>
    `;
}

const profileCards = profiles.map(profile => generateProfileCard(profile)).join('');
const indexHtml = indexTemplate.replace('{{PROFILES}}', profileCards);
fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml);

profiles.forEach(profile => {
    // 既存のページがある場合はスキップ
    if (profile.originalPage) {
        console.log(`📌 既存ページを使用: ${profile.name} -> ${profile.originalPage}`);
        return;
    }
    
    let html = profileTemplate
        .replace(/{{NAME}}/g, profile.name)
        .replace('{{AGE}}', profile.age || '非公開')
        .replace('{{OCCUPATION}}', profile.occupation)
        .replace('{{LOCATION}}', profile.location)
        .replace('{{BIO}}', profile.bio)
        .replace('{{IMAGE}}', profile.image)
        .replace('{{SKILLS_SECTION}}', generateSkillsSection(profile.skills));
    
    fs.writeFileSync(path.join(__dirname, `${profile.id}.html`), html);
});

const newPages = profiles.filter(p => !p.originalPage).length;
console.log('✨ サイト生成完了！');
console.log(`📄 生成されたページ数: ${newPages + 1} (一覧ページ + 新規プロフィール)`);
console.log(`📌 既存ページリンク数: ${profiles.filter(p => p.originalPage).length}`);
console.log('🚀 サーバーを起動するには: npm run serve (またはポート8080: python3 -m http.server 8080)');
console.log('📝 新しい人物を追加するには: profiles.jsonを編集してnpm run generateを実行');