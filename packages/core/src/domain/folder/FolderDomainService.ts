import { MAX_FOLDERS_PER_USER } from '../../constants/limits';

/**
 * フォルダに関するドメインサービス
 * エンティティ単体では表現できないビジネスルールを実装
 */
export class FolderDomainService {
  /**
   * ユーザーがフォルダを新規作成可能かチェック
   * @param currentFolderCount 現在のフォルダ数
   * @returns 作成可能な場合true、制限に達している場合false
   */
  static canCreateFolder(currentFolderCount: number): boolean {
    return currentFolderCount < MAX_FOLDERS_PER_USER;
  }
}
