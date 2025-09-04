# Google認証セットアップガイド

## Google OAuth 2.0の設定手順

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択

### 2. OAuth 2.0クライアントIDを作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuthクライアントID」をクリック
3. アプリケーションの種類で「ウェブアプリケーション」を選択
4. 以下の設定を行う：
   - **名前**: 任意の名前（例：Profile Generator）
   - **承認済みのJavaScript生成元**: 
     - `http://localhost:8000` （開発環境）
     - `http://localhost:3001` （Node.jsサーバー使用時）
     - 本番環境のURL（デプロイ時に追加）
   - **承認済みのリダイレクトURI**: 
     - `http://localhost:8000/auth-callback.html` （開発環境）
     - `http://localhost:3001/auth-callback.html` （Node.jsサーバー使用時）
     - 本番環境のURL + `/auth-callback.html` （デプロイ時に追加）

5. 「作成」をクリック

### 3. クライアントIDを設定

1. 作成されたOAuthクライアントIDをコピー
2. `login.html`の以下の行を更新：

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

実際のクライアントIDに置き換える：

```javascript
const GOOGLE_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
```

### 4. OAuth同意画面の設定

1. 「APIとサービス」→「OAuth同意画面」を選択
2. 以下の必須項目を設定：
   - **アプリ名**: Profile Generator（任意）
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
3. スコープは追加不要（基本的なプロフィール情報のみ使用）
4. テストユーザーを追加（開発中の場合）

### 5. 動作確認

1. ブラウザでアプリケーションを開く
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン
4. 初回はアプリへのアクセス許可を求められるので「続行」をクリック

## トラブルシューティング

### エラー: "popup_closed_by_user"
- ポップアップブロッカーが有効になっている可能性があります
- ブラウザの設定でlocalhost:8000のポップアップを許可してください

### エラー: "invalid_client"
- クライアントIDが正しく設定されているか確認
- 承認済みのJavaScript生成元にアクセスしているURLが含まれているか確認

### エラー: "idpiframe_initialization_failed"
- サードパーティCookieがブロックされている可能性があります
- ブラウザの設定でサードパーティCookieを許可してください

## セキュリティ注意事項

- クライアントIDは公開されても問題ありませんが、クライアントシークレットは使用しないでください
- 本番環境では必ずHTTPSを使用してください
- 承認済みのJavaScript生成元には信頼できるドメインのみを追加してください