# Apple Sign in with Apple 運用ガイド

## Secret更新手順（6ヶ月ごと）

⚠️ Secretは**180日（6ヶ月）で期限切れ**。期限切れ後はApple Sign-Inが動作しなくなります。

### 更新手順

#### 1. Secret再生成

プロジェクトルートから実行:

```bash
node secret_keys/scripts/generate-apple-secret.js preview
node secret_keys/scripts/generate-apple-secret.js production
```

#### 2. 各環境を更新

**Preview:**
1. [Supabase Dashboard](https://supabase.com/dashboard) → Previewプロジェクト
2. **Authentication** → **Providers** → **Apple**
3. **Secret Key (for OAuth)** を更新
4. **Save**

**Production:**
1. [Supabase Dashboard](https://supabase.com/dashboard) → Productionプロジェクト
2. **Authentication** → **Providers** → **Apple**
3. **Secret Key (for OAuth)** を更新
4. **Save**

#### 3. 次回リマインダー設定

カレンダーに次回更新日（6ヶ月後）を登録

