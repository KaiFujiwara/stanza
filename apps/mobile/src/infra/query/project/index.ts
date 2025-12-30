/**
 * Project Query Service
 *
 * プロジェクト画面表示に最適化されたクエリ群
 */

// Types
export type {
  ProjectListItem,
  ProjectsOverview,
  ProjectDetail,
} from './types';

// Queries
export { getProjectsOverview } from './getProjectsOverview';
export { getProjectDetail } from './getProjectDetail';
