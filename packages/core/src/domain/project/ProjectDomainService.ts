import { MAX_PROJECTS_PER_USER } from '../../constants/limits';

/**
 * プロジェクトに関するドメインサービス
 * エンティティ単体では表現できないビジネスルールを実装
 */
export class ProjectDomainService {
  /**
   * ユーザーがプロジェクトを新規作成可能かチェック
   * @param currentProjectCount 現在のプロジェクト数
   * @returns 作成可能な場合true、制限に達している場合false
   */
  static canCreateProject(currentProjectCount: number): boolean {
    return currentProjectCount < MAX_PROJECTS_PER_USER;
  }
}
