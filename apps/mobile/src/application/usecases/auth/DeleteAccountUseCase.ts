import { deleteAccount } from '@/lib/supabase/auth';

/**
 * アカウント削除UseCase
 *
 * ユーザーアカウントと関連するすべてのデータを完全に削除します。
 * この操作は取り消しできません。
 */
export class DeleteAccountUseCase {
  async execute(): Promise<void> {
    // アカウントとすべてのデータを削除
    await deleteAccount();
  }
}
