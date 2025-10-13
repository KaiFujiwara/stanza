import { sqliteDataSource } from './datasources/sqlite';
import { migrations } from './migrations';

// マイグレーション定義
interface Migration {
  name: string;
  statements: string[];
}

// 多重実行ガード
let isRunning = false;

// SQL文を整形（コメント削除、末尾セミコロン補完）
function cleanSqlStatement(sql: string): string {
  const cleaned = sql
    .trim()
    .replace(/--.*$/gm, '') // 行コメント削除
    .replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント削除
    .trim();

  // 末尾セミコロン補完
  return cleaned && !cleaned.endsWith(';') ? cleaned + ';' : cleaned;
}

// マイグレーション一覧を取得
function getMigrations(): Migration[] {
  return migrations.map(migration => ({
    name: migration.name,
    statements: migration.statements.map(cleanSqlStatement).filter(s => s.length > 0)
  }));
}

// migrationsテーブルの作成
async function ensureMigrationsTable(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);
}

// 未実行マイグレーション検出
export async function detectPendingMigrations(): Promise<Migration[]> {
  const db = await sqliteDataSource.getDatabase();

  // migrationsテーブルを確実に作成
  await ensureMigrationsTable(db);

  // 実行済みマイグレーション取得
  const executedMigrations = await db.getAllAsync<{ name: string }>(
    'SELECT name FROM migrations'
  );
  const executedNames = new Set(executedMigrations.map(m => m.name));

  // マイグレーション一覧から未実行のものを抽出
  const allMigrations = getMigrations();
  return allMigrations.filter(migration => !executedNames.has(migration.name));
}

export async function runMigrations(): Promise<void> {
  // 多重実行ガード
  if (isRunning) {
    console.warn('Migration already running, skipping');
    return;
  }

  isRunning = true;

  try {
    const db = await sqliteDataSource.getDatabase();

    const pendingMigrations = await detectPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    // 未適用のマイグレーション実行
    for (const migration of pendingMigrations) {
      console.log(`Applying migration: ${migration.name}`);

      try {
        await db.withTransactionAsync(async () => {
          // SQL文を順次実行
          for (const statement of migration.statements) {
            if (statement.length > 0) {
              await db.execAsync(statement);
            }
          }

          // 実行済みとして記録
          await db.runAsync(
            'INSERT INTO migrations (name, applied_at) VALUES (?, ?)',
            [migration.name, Date.now()]
          );
        });

        console.log(`Migration ${migration.name} applied successfully`);
      } catch (error) {
        console.error(`Failed to apply migration ${migration.name}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed');
  } finally {
    isRunning = false;
  }
}

export async function getExecutedMigrations(): Promise<string[]> {
  const db = await sqliteDataSource.getDatabase();

  // migrationsテーブルを確実に作成
  await ensureMigrationsTable(db);

  const result = await db.getAllAsync<{ name: string }>(
    'SELECT name FROM migrations ORDER BY applied_at'
  );
  return result.map(m => m.name);
}