// マイグレーション自動エクスポート
import m001 from './001_create_migration_table';
import m002 from './002_create_initial_schema';
// 新しいマイグレーション: import m003 from './003_xxx';

export const migrations = [m001, m002];