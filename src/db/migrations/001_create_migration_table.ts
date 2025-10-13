// マイグレーション管理テーブルの作成

const migration = {
  name: '001_create_migration_table',
  statements: [
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name)`
  ]
};

export default migration;