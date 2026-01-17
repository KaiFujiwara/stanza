import { DeleteAccountUseCase } from '@/application/usecases/auth/DeleteAccountUseCase';
import * as auth from '@/lib/supabase/auth';

// authモジュールをモック
jest.mock('@/lib/supabase/auth', () => ({
  deleteAccount: jest.fn(),
}));

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
  let mockDeleteAccount: jest.MockedFunction<typeof auth.deleteAccount>;

  beforeEach(() => {
    mockDeleteAccount = auth.deleteAccount as jest.MockedFunction<typeof auth.deleteAccount>;
    useCase = new DeleteAccountUseCase();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にアカウント削除を実行できる', async () => {
      mockDeleteAccount.mockResolvedValue();

      await useCase.execute();

      expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it('アカウント削除に失敗した場合、エラーをスローする', async () => {
      const error = new Error('Failed to delete account');
      mockDeleteAccount.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Failed to delete account');
      expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
    });
  });
});
