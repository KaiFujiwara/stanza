#!/usr/bin/env node
/**
 * Apple Sign in with Apple Secret Generator
 *
 * このスクリプトは、Apple Sign in with Appleで使用するJWT形式のClient Secretを生成します。
 *
 * 使用方法:
 *   node generate-apple-secret.js <environment>
 *
 * 例:
 *   node generate-apple-secret.js preview
 *   node generate-apple-secret.js production
 *
 * 前提条件:
 *   - AuthKey_*.p8 ファイルが secret_keys/apple/ に配置されていること
 *   - jsonwebtoken パッケージがインストールされていること (npm install jsonwebtoken)
 *   - TEAM_ID を設定していること
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// ===================================
// 設定: ここを編集してください
// ===================================

// Team ID (Apple Developer Membership で確認)
// https://developer.apple.com/account/#/membership
const TEAM_ID = 'YOUR_TEAM_ID';  // ← ここを実際のTeam IDに変更

// Key ID (Keyを作成した際に表示された10文字の英数字)
const KEY_ID = 'XXXXXXXXXX';

// .p8ファイルのパス (apple/ ディレクトリに配置)
const KEY_FILE = path.join(__dirname, '../apple/AuthKey_XXXXXXXXXX.p8');

// 環境ごとのClient ID (Services ID)
const CLIENT_IDS = {
  preview: 'com.somedon.stanza.preview.services',
  production: 'com.somedon.stanza.services',
};

// ===================================
// スクリプト本体
// ===================================

function main() {
  // 引数チェック
  const env = process.argv[2];
  if (!env || !CLIENT_IDS[env]) {
    console.error('\n❌ エラー: 環境の指定が正しくありません\n');
    console.error('使い方: node generate-apple-secret.js <environment>\n');
    console.error('利用可能な環境:');
    Object.keys(CLIENT_IDS).forEach(e => console.error(`  - ${e}`));
    console.error('');
    process.exit(1);
  }

  // Team ID設定チェック
  if (TEAM_ID === 'YOUR_TEAM_ID') {
    console.error('\n❌ エラー: TEAM_ID が設定されていません\n');
    console.error('このスクリプトを編集してTEAM_IDを設定してください。');
    console.error('Team IDは以下のURLで確認できます:');
    console.error('https://developer.apple.com/account/#/membership\n');
    process.exit(1);
  }

  const clientId = CLIENT_IDS[env];

  try {
    // .p8ファイルを読み込み
    const privateKey = fs.readFileSync(KEY_FILE, 'utf8');

    // JWT生成
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 180 * 24 * 60 * 60; // 180日（6ヶ月）を秒に変換

    const token = jwt.sign(
      {},
      privateKey,
      {
        algorithm: 'ES256',
        expiresIn: '180d', // 6ヶ月
        audience: 'https://appleid.apple.com',
        issuer: TEAM_ID,
        subject: clientId,
        keyid: KEY_ID,
      }
    );

    // 有効期限を計算
    const expiryDate = new Date((now + expiresIn) * 1000);
    const formattedExpiry = expiryDate.toISOString().split('T')[0];

    // 結果を出力
    console.log('\n' + '='.repeat(70));
    console.log(`  ${env.toUpperCase()} 環境用 Apple Secret`);
    console.log('='.repeat(70));
    console.log(`\n📋 Client ID (Services ID):`);
    console.log(`   ${clientId}`);
    console.log(`\n🔑 Secret Key (for OAuth):\n`);
    console.log(`   ${token}`);
    console.log('\n' + '='.repeat(70));
    console.log(`⏰ 有効期限: ${formattedExpiry} (180日後)`);
    console.log('⚠️  有効期限が切れる前に再生成してください！');
    console.log('='.repeat(70) + '\n');

    // 次にやること
    console.log('📝 次のステップ:\n');
    console.log('   1. 上記のSecret Keyをコピー');
    console.log(`   2. Supabase Dashboard (${env}プロジェクト) を開く`);
    console.log('   3. Authentication → Providers → Apple に移動');
    console.log(`   4. Client IDを設定: ${clientId}`);
    console.log('   5. Secret Keyを貼り付け');
    console.log('   6. Save をクリック\n');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    if (error.code === 'ENOENT') {
      console.error(`\n.p8ファイルが見つかりません: ${KEY_FILE}`);
      console.error('AuthKey_*.p8 ファイルが secret_keys/apple/ ディレクトリに配置されているか確認してください。\n');
    } else if (error.message.includes('PEM')) {
      console.error('\n.p8ファイルの形式が正しくありません。');
      console.error('Apple Developer Console から正しいファイルをダウンロードしたか確認してください。\n');
    }
    process.exit(1);
  }
}

main();
