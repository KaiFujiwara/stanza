import { MAX_TAGS_PER_USER } from '../../constants/limits';
import { TagNameValue } from './vo/TagName';
import { DomainError } from '../shared/errors/DomainError';
import { ErrorCode } from '../shared/errors/ErrorCode';

/**
 * タグに関するドメインサービス
 * エンティティ単体では表現できないビジネスルールを実装
 */
export class TagDomainService {
  /**
   * ユーザーがタグを新規作成可能かチェック
   * @param currentTagCount 現在のタグ数
   * @returns 作成可能な場合true、制限に達している場合false
   */
  static canCreateTag(currentTagCount: number): boolean {
    return currentTagCount < MAX_TAGS_PER_USER;
  }

  /**
   * タグ名が一意であることを保証
   * @param tagName バリデーション済みタグ名
   * @param exists タグ名が既に存在するかどうか（リポジトリから取得）
   * @throws {DomainError} タグ名が重複している場合
   */
  static ensureUniqueTagName(tagName: TagNameValue, exists: boolean): void {
    if (exists) {
      throw new DomainError(
        ErrorCode.DUPLICATE_NAME,
        `タグ名「${tagName}」は既に使用されています`,
        { field: 'tagName', value: tagName }
      );
    }
  }
}
