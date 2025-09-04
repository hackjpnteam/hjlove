// API Client for MongoDB backend
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/api';

class APIClient {
    // イベント関連
    async getEvents() {
        try {
            const response = await fetch(`${API_BASE}/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.warn('API接続エラー、ローカルストレージを使用:', error);
            // フォールバック: localStorage
            const stored = localStorage.getItem('communityEvents');
            if (stored) {
                return JSON.parse(stored);
            }
            return this.getDefaultEvents();
        }
    }
    
    async saveEvents(events) {
        try {
            // 全イベントをMongoDBに更新
            await fetch(`${API_BASE}/events`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(events)
            });
        } catch (error) {
            console.warn('API保存エラー、ローカルストレージに保存:', error);
        }
        // 常にローカルストレージにも保存（フォールバック用）
        localStorage.setItem('communityEvents', JSON.stringify(events));
    }
    
    async addEvent(event) {
        try {
            const events = await this.getEvents();
            events.unshift(event);
            await this.saveEvents(events);
            return event;
        } catch (error) {
            console.error('イベント追加エラー:', error);
            throw error;
        }
    }
    
    // プロフィール関連
    async getProfiles() {
        try {
            const response = await fetch(`${API_BASE}/profiles`);
            if (!response.ok) throw new Error('Failed to fetch profiles');
            return await response.json();
        } catch (error) {
            console.warn('API接続エラー、ローカルストレージを使用:', error);
            const stored = localStorage.getItem('profiles');
            return stored ? JSON.parse(stored) : [];
        }
    }
    
    async saveProfiles(profiles) {
        try {
            await fetch(`${API_BASE}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profiles })
            });
        } catch (error) {
            console.warn('API保存エラー、ローカルストレージに保存:', error);
        }
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }
    
    // ユーザー関連
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE}/users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.warn('API接続エラー、ローカルストレージを使用:', error);
            const stored = localStorage.getItem('users');
            return stored ? JSON.parse(stored) : {};
        }
    }
    
    async saveUsers(users) {
        try {
            await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(users)
            });
        } catch (error) {
            console.warn('API保存エラー、ローカルストレージに保存:', error);
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // デフォルトデータ
    getDefaultEvents() {
        return [
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
    }
}

// グローバルAPIクライアントインスタンス
window.apiClient = new APIClient();