import { sqliteDataSource } from './datasources/sqlite';
import { detectPendingMigrations, runMigrations } from './migration-runner';
import { createSnapshot, rotateSnapshots } from './snapshot';

// 初期化状態管理
let isInitialized = false;
let isInitializing = false;
let initializationError: Error | null = null;
let initializationPromise: Promise<void> | null = null;

// マイグレーション処理（スナップショット込み）
async function handleMigrations(): Promise<void> {
  try {
    // 未実行マイグレーション検出
    const pendingMigrations = await detectPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    // マイグレーション前スナップショット作成（失敗しても処理続行）
    try {
      console.log('Creating pre-migration snapshot...');
      await createSnapshot('pre-migration');
      await rotateSnapshots(3);
      console.log('Snapshot created successfully');
    } catch (snapshotError) {
      console.warn('Failed to create snapshot, continuing without backup:', snapshotError);
      // スナップショット失敗してもマイグレーションは続行
    }

    // マイグレーション実行
    await runMigrations();

    console.log('Migration process completed');
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  }
}

// データベース初期化（多重呼び出し安全）
export async function initializeDatabase(): Promise<void> {
  // 既に初期化済み
  if (isInitialized) {
    if (initializationError) {
      throw initializationError;
    }
    return;
  }

  // 初期化中の場合は同じPromiseを共有（ビジーウェイト回避）
  if (initializationPromise) {
    return initializationPromise;
  }

  // 初期化Promise作成・実行
  initializationPromise = (async () => {
    isInitializing = true;
    initializationError = null;

    try {
      console.log('Initializing database runtime...');

      // データベース接続（PRAGMA設定も同時実行）
      const db = await sqliteDataSource.getDatabase();
      console.log('Database connection established');

      // マイグレーション処理
      await handleMigrations();

      isInitialized = true;
      console.log('Database runtime initialization completed successfully');

    } catch (error) {
      console.error('Database initialization failed:', error);
      initializationError = error as Error;
      throw error;
    } finally {
      isInitializing = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

// 初期化完了チェック
export function isDatabaseReady(): boolean {
  return isInitialized;
}

// 初期化エラー取得
export function getInitializationError(): Error | null {
  return initializationError;
}

// 安全なデータベース取得（初期化チェック付き）
export async function getSafeDatabase() {
  if (!isInitialized) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }

  return await sqliteDataSource.getDatabase();
}

// 開発用: 初期化状態リセット
export function resetInitializationState(): void {
  if (__DEV__) {
    isInitialized = false;
    isInitializing = false;
    initializationError = null;
    initializationPromise = null;
    console.log('Database initialization state reset (development only)');
  }
}