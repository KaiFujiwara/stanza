import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

// 環境別データベース名
function getDatabaseName(): string {
  const env = Constants.expoConfig?.extra?.APP_ENV || (__DEV__ ? 'dev' : 'prod');
  return `lyrics_notes.${env}.db`;
}

// SQLiteデータソース（シングルトン）
export class SQLiteDataSource {
  private static instance: SQLiteDataSource;
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): SQLiteDataSource {
    if (!SQLiteDataSource.instance) {
      SQLiteDataSource.instance = new SQLiteDataSource();
    }
    return SQLiteDataSource.instance;
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(getDatabaseName());

      // 初回接続時にPRAGMA設定（1回のみ）
      if (!this.initialized) {
        await this.configurePragmas();
        this.initialized = true;
      }
    }
    return this.db;
  }

  private async configurePragmas(): Promise<void> {
    if (!this.db) return;

    console.log('Configuring database PRAGMA settings...');

    // WALモード（並行読み取り可能、パフォーマンス向上）
    await this.db.execAsync('PRAGMA journal_mode = WAL');

    // 外部キー制約を有効化（データ整合性）
    await this.db.execAsync('PRAGMA foreign_keys = ON');

    // ビジータイムアウト（デッドロック防止）
    await this.db.execAsync('PRAGMA busy_timeout = 3000');

    // 同期モード（耐久性と性能のバランス）
    await this.db.execAsync('PRAGMA synchronous = NORMAL');

    console.log('Database PRAGMA settings configured');
  }
}

export const sqliteDataSource = SQLiteDataSource.getInstance();