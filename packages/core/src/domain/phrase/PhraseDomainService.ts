import { MAX_PHRASES_PER_USER } from '../../constants/limits';

/**
 * フレーズに関するドメインサービス
 * エンティティ単体では表現できないビジネスルールを実装
 */
export class PhraseDomainService {
  /**
   * ユーザーがフレーズを新規作成可能かチェック
   * @param currentPhraseCount 現在のフレーズ数
   * @returns 作成可能な場合true、制限に達している場合false
   */
  static canCreatePhrase(currentPhraseCount: number): boolean {
    return currentPhraseCount < MAX_PHRASES_PER_USER;
  }
}
