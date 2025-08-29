// プロフィールページ生成機能

class ProfileGenerator {
    constructor() {
        this.profiles = this.loadProfiles();
    }

    // 既存のプロフィールを読み込み
    loadProfiles() {
        try {
            const stored = localStorage.getItem('profiles');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('プロフィール読み込みエラー:', error);
            return [];
        }
    }

    // プロフィールを保存
    saveProfiles() {
        try {
            localStorage.setItem('profiles', JSON.stringify(this.profiles));
        } catch (error) {
            console.error('プロフィール保存エラー:', error);
        }
    }

    // プロフィールIDを生成
    generateProfileId(name) {
        const baseId = name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        
        // 重複チェック
        let id = baseId;
        let counter = 1;
        while (this.profiles.find(p => p.id === id)) {
            id = `${baseId}-${counter}`;
            counter++;
        }
        
        return id;
    }

    // プロフィールHTML生成
    generateProfileHTML(profileData) {
        const { id, name, englishName, age, location, occupation, bio, skills } = profileData;
        
        const englishNameDisplay = englishName ? `<span class="hero-subtitle">${englishName}</span>` : '';
        const ageDisplay = age ? `${age}歳` : '';
        const locationDisplay = location ? ` • ${location}` : '';
        const occupationFull = `${occupation}${ageDisplay}${locationDisplay}`;

        // スキルカードを生成
        const skillCards = skills && skills.length > 0 ? skills.map(skill => `
            <div class="about-card">
                <div class="about-icon">💡</div>
                <h3>${skill}</h3>
                <p>専門スキルとして習得</p>
            </div>
        `).join('') : '';

        // バイオグラフィーを段落に分割
        const bioSentences = bio.split(/[。．！？\n]/).filter(s => s.trim().length > 0);
        const bioParagraphs = bioSentences.map(sentence => `<p class="bio-text">${sentence.trim()}。</p>`).join('');

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - プロフィール</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #667eea;
            --primary-dark: #5a67d8;
            --secondary: #6B7280;
            --text-primary: #111827;
            --text-secondary: #6B7280;
            --bg-light: #f8fafc;
            --bg-white: #FFFFFF;
            --border: #e2e8f0;
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
        }

        body {
            font-family: 'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .navbar {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border);
            z-index: 1000;
            padding: 1rem 0;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-brand {
            font-weight: 800;
            font-size: 1.5rem;
            background: var(--gradient-2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
        }

        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-link:hover {
            color: var(--primary);
        }

        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 6rem 2rem 4rem;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .hero-content {
            max-width: 800px;
            text-align: center;
            z-index: 2;
            position: relative;
            color: white;
        }

        .hero-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            backdrop-filter: blur(10px);
        }

        .hero-title {
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.1;
            color: white;
        }

        .hero-subtitle {
            display: block;
            font-size: 0.5em;
            font-weight: 300;
            margin-top: 0.5rem;
            opacity: 0.9;
        }

        .hero-description {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
            font-weight: 400;
        }

        .hero-cta {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn {
            padding: 0.875rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
            font-size: 1rem;
        }

        .btn-primary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-primary:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-2px);
        }

        .section {
            padding: 5rem 2rem;
        }

        .section-alt {
            background: var(--bg-light);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-title {
            font-size: 2.5rem;
            font-weight: 800;
            text-align: center;
            margin-bottom: 3rem;
            background: var(--gradient-2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .about-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .about-card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            text-align: center;
        }

        .about-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .about-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .about-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .about-card p {
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .bio-section {
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .bio-title {
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }

        .bio-text {
            color: var(--text-secondary);
            line-height: 1.8;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }

        .contact-content {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }

        .contact-text {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.8;
        }

        .contact-links {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
        }

        .contact-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: white;
            border: 2px solid var(--border);
            border-radius: 12px;
            text-decoration: none;
            color: var(--text-primary);
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .contact-link:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .contact-icon {
            font-size: 1.25rem;
        }

        .footer {
            background: var(--text-primary);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .back-link {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px 20px;
            border-radius: 25px;
            text-decoration: none;
            color: var(--primary);
            font-weight: 600;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            z-index: 1001;
        }

        .back-link:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }
            
            .hero-cta {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                width: 100%;
                max-width: 300px;
            }
            
            .contact-links {
                flex-direction: column;
                align-items: center;
            }
            
            .contact-link {
                width: 100%;
                max-width: 300px;
            }
        }
    </style>
</head>
<body>
    <a href="../index.html" class="back-link">← 一覧に戻る</a>

    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge">${occupation.split(' ')[0]}</div>
            <h1 class="hero-title">${name}${englishNameDisplay}</h1>
            <p class="hero-description">${occupationFull}</p>
            <div class="hero-cta">
                <a href="#about" class="btn btn-primary">詳しく見る</a>
                <a href="#contact" class="btn btn-secondary">お問い合わせ</a>
            </div>
        </div>
    </section>

    <section id="about" class="section">
        <div class="container">
            <h2 class="section-title">私について</h2>
            <div class="about-grid">
                ${skillCards || `
                <div class="about-card">
                    <div class="about-icon">👤</div>
                    <h3>プロフェッショナル</h3>
                    <p>${occupation}として活動しています。</p>
                </div>
                `}
            </div>
            <div class="bio-section">
                <h3 class="bio-title">プロフィール</h3>
                ${bioParagraphs}
            </div>
        </div>
    </section>

    <section id="contact" class="section section-alt">
        <div class="container">
            <h2 class="section-title">お問い合わせ</h2>
            <div class="contact-content">
                <p class="contact-text">
                    ご質問やお仕事のご依頼など、お気軽にお問い合わせください。
                    お返事をお待ちしております。
                </p>
                <div class="contact-links">
                    <a href="#" class="contact-link">
                        <span class="contact-icon">📧</span>
                        メール
                    </a>
                    <a href="#" class="contact-link">
                        <span class="contact-icon">💼</span>
                        LinkedIn
                    </a>
                    <a href="#" class="contact-link">
                        <span class="contact-icon">🐦</span>
                        Twitter
                    </a>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${name}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
    }

    // 新しいプロフィールを追加
    addProfile(profileData) {
        const id = this.generateProfileId(profileData.name);
        
        // 現在ログイン中のユーザー情報を取得
        const currentUser = this.getCurrentUser();
        
        const profile = {
            id,
            ...profileData,
            createdBy: currentUser ? currentUser.email : 'tomura@hackjpn.com',
            createdByName: currentUser ? currentUser.name : '戸村光',
            createdAt: new Date().toISOString()
        };
        
        this.profiles.push(profile);
        this.saveProfiles();
        
        return profile;
    }

    // 現在ログイン中のユーザー情報を取得
    getCurrentUser() {
        try {
            // ローカルストレージから現在のユーザー情報を取得
            const currentUser = localStorage.getItem('currentUser');
            return currentUser ? JSON.parse(currentUser) : null;
        } catch (error) {
            console.error('ユーザー情報取得エラー:', error);
            return null;
        }
    }

    // プロフィールの編集権限をチェック
    canEditProfile(profile) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;
        
        // プロフィールの作成者か、またはtomura@hackjpn.comアカウントの場合は編集可能
        return profile.createdBy === currentUser.email || currentUser.email === 'tomura@hackjpn.com';
    }

    // プロフィールを更新
    updateProfile(id, updatedData) {
        const index = this.profiles.findIndex(p => p.id === id);
        if (index !== -1) {
            this.profiles[index] = {
                ...this.profiles[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveProfiles();
            return this.profiles[index];
        }
        throw new Error('プロフィールが見つかりません');
    }

    // プロフィールページを作成
    createProfilePage(profileData) {
        const profile = this.addProfile(profileData);
        
        // メインのプロフィールリストを更新
        this.updateMainProfileList();
        
        return profile;
    }

    // profiles.jsonファイルを更新
    updateProfilesJson() {
        const profilesData = this.profiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            englishName: profile.englishName || null,
            age: profile.age || null,
            occupation: profile.occupation,
            location: profile.location || null,
            bio: profile.bio,
            skills: profile.skills || [],
            image: profile.image || this.generateSampleImage(profile.name, this.estimateGender(profile.name)),
            originalPage: `${profile.id}/index.html`
        }));

        const jsonBlob = new Blob([JSON.stringify(profilesData, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = 'profiles.json';
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
    }

    // メインのプロフィールリストを更新
    updateMainProfileList() {
        // JavaScriptで動的にプロフィールカードを追加
        this.addToProfileGrid();
    }

    // プロフィールグリッドに新しいプロフィールを追加
    addToProfileGrid() {
        // ホームページにプロフィールを追加
        if (typeof window !== 'undefined' && window.location.pathname.includes('index.html')) {
            this.refreshProfileGrid();
        }
    }

    // プロフィールグリッドをリフレッシュ
    refreshProfileGrid() {
        const profilesGrid = document.getElementById('profilesGrid');
        if (profilesGrid) {
            // 既存のプロフィールと新しいプロフィールを統合
            const allProfiles = this.getAllProfilesForDisplay();
            profilesGrid.innerHTML = allProfiles.map(profile => this.createProfileCardHTML(profile)).join('');
        }
    }

    // 表示用のプロフィールデータを取得
    getAllProfilesForDisplay() {
        // 既存のハードコードされたプロフィール
        const existingProfiles = [
            {
                id: "ayaka",
                name: "園田彩掛",
                englishName: "Ayaka Sonoda",
                age: 23,
                occupation: "早稲田大学大学院M2",
                location: "群馬県",
                bio: "スキー同好会所属。母の乳がん体験をきっかけに、患者様とその家族を支える医療の重要性を実感。未来のMRを目指して日々学習中。",
                skills: ["スキー（特にコブ）", "パン・お菓子作り", "ボランティア活動", "教育支援", "医療知識"],
                image: "ayaka/profile.jpg",
                originalPage: "ayaka/index.html",
                createdBy: "tomura@hackjpn.com",
                createdByName: "戸村光",
                createdAt: "2024-01-15T10:00:00.000Z"
            },
            {
                id: "chika",
                name: "上林ちか",
                englishName: "Chika Kambayashi",
                occupation: "プルデンシャル生命 ライフプランナー",
                location: "東京",
                bio: "お客様一人ひとりに最適な保障設計をご提案。JC活動にも積極的に参加し、地元への貢献と人間的成長を目指しています。",
                skills: ["ライフプランニング", "保険設計", "問題解決", "JC活動", "顧客対応", "リスク分析"],
                originalPage: "chika/index.html",
                createdBy: "tomura@hackjpn.com",
                createdByName: "戸村光",
                createdAt: "2024-01-20T14:30:00.000Z"
            },
            {
                id: "hikaru",
                name: "戸村光",
                englishName: "Hikaru Tomura",
                age: 30,
                occupation: "連続起業家・Forbes公式コラムニスト",
                location: "シリコンバレー/東京",
                bio: "20歳でシリコンバレーにてHACKJPNを創業。スタートアップと投資家のための革新的なデータソリューションを提供。Forbes公式コラムニストとして活動。",
                skills: ["起業", "投資", "AI/機械学習", "メディア執筆", "データ分析", "ビジネス戦略"],
                originalPage: "hikaru/index.html",
                createdBy: "tomura@hackjpn.com",
                createdByName: "戸村光",
                createdAt: "2024-01-10T09:15:00.000Z"
            }
        ];

        // 新しく作成されたプロフィールを追加
        const newProfiles = this.profiles.map(profile => ({
            ...profile,
            image: profile.image || this.generateSampleImage(profile.name, this.estimateGender(profile.name)),
            originalPage: null // 新しいプロフィールはHTMLファイルとしてダウンロードされるため
        }));

        return [...existingProfiles, ...newProfiles];
    }

    // プロフィールカードのHTMLを生成
    createProfileCardHTML(profile) {
        const gender = this.estimateGender(profile.name);
        const sampleImage = this.generateSampleImage(profile.name, gender);
        // アップロードされた画像があればそれを使用、なければサンプル画像
        const imageUrl = profile.image || sampleImage;
        
        const englishName = profile.englishName ? 
            `<div class="profile-english">${profile.englishName}</div>` : '';
        
        const age = profile.age ? `${profile.age}歳` : '';
        const location = profile.location ? ` • ${profile.location}` : '';
        
        const skillsHtml = profile.skills && profile.skills.length > 0 ? 
            `<div class="profile-skills">
                <span class="skills-label">スキル・専門分野</span>
                <div class="skills-list">
                    ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>` : '';
        
        const clickHandler = profile.originalPage ? 
            `onclick="window.open('${profile.originalPage}', '_blank')"` : 
            `onclick="window.open('profile-view.html?id=${profile.id}', '_blank')"`;

        // 編集権限チェック
        const canEdit = this.canEditProfile(profile);
        const editButtonHTML = (canEdit && !profile.originalPage) ? 
            `<button onclick="event.stopPropagation(); editProfile('${profile.id}')" style="background: #667eea; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-left: 8px;">編集</button>` : '';

        // Fallback image generation for onerror
        const fallbackImage = generatePlaceholder(300, 300, '#cccccc', '#ffffff', profile.name.substring(0, 2));
        
        return `
            <div class="profile-card" ${clickHandler}>
                <div class="profile-header">
                    <img src="${imageUrl}" alt="${profile.name}" class="profile-image" 
                         onerror="this.src='${fallbackImage}'">
                    <div class="profile-info">
                        <h3>${profile.name}</h3>
                        ${englishName}
                        <div class="profile-occupation">${profile.occupation || '職業不明'}${age}${location}</div>
                    </div>
                </div>
                <div class="profile-bio">${this.truncateText(profile.bio || '詳細情報はありません。', 150)}</div>
                ${skillsHtml}
                <div class="profile-meta">
                    <span style="color: #666;">👤 ${profile.createdByName || profile.createdBy || '不明'}</span>
                    ${editButtonHTML}
                </div>
            </div>
        `;
    }

    // 性別推定関数
    estimateGender(name) {
        const maleNames = ['太郎', '一郎', '二郎', '光', '健', '誠', '洋', '博', '雄', '男', '夫', '彦'];
        const femaleNames = ['子', '美', '恵', '香', '奈', '菜', '花', '華', '愛', '彩', '咲', 'ちか', 'あやか'];
        
        for (let male of maleNames) {
            if (name.includes(male)) return 'male';
        }
        for (let female of femaleNames) {
            if (name.includes(female)) return 'female';
        }
        return 'unknown';
    }

    // サンプル画像URL生成
    generateSampleImage(name, gender) {
        const colors = ['#667eea', '#764ba2', '#4CAF50', '#2196F3', '#ff6b6b', '#ffa726'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        let icon = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'U';
        const text = icon + ' ' + name;
        
        // Use local placeholder generator
        return generatePlaceholder(300, 300, color, '#ffffff', text);
    }

    // テキストを指定文字数で切り詰める
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        // 文の境界で切り詰めを試みる
        const truncated = text.substring(0, maxLength);
        const lastSentenceEnd = Math.max(
            truncated.lastIndexOf('。'),
            truncated.lastIndexOf('！'),
            truncated.lastIndexOf('？')
        );
        
        if (lastSentenceEnd > maxLength * 0.6) {
            return text.substring(0, lastSentenceEnd + 1);
        }
        
        return truncated + '...';
    }

    // 全プロフィールを取得
    getAllProfiles() {
        return this.profiles;
    }

    // プロフィールを削除
    deleteProfile(id) {
        this.profiles = this.profiles.filter(p => p.id !== id);
        this.saveProfiles();
    }
}

// グローバルインスタンス
window.profileGenerator = new ProfileGenerator();