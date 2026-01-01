import { MAX_GENRES_PER_USER } from '../../constants/limits';

/**
 * ジャンルに関するドメインサービス
 * エンティティ単体では表現できないビジネスルールを実装
 */
export class GenreDomainService {
  /**
   * ユーザーがジャンルを新規作成可能かチェック
   * @param currentGenreCount 現在のジャンル数
   * @returns 作成可能な場合true、制限に達している場合false
   */
  static canCreateGenre(currentGenreCount: number): boolean {
    return currentGenreCount < MAX_GENRES_PER_USER;
  }
}
