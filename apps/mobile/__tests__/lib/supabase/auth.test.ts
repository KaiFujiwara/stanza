import { supabase } from '@/lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo関連のモジュールをモック
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'stanza://auth/callback'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

// AsyncStorageをモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// supabaseモジュールをモック
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
      signInAnonymously: jest.fn(),
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
    },
    rpc: jest.fn(),
  },
}));

// checkSession, deleteAccountをインポート（モックの後に）
import { checkSession, deleteAccount } from '@/lib/supabase/auth';

describe('auth', () => {
  describe('checkSession', () => {
    const mockGetSession = supabase.auth.getSession as jest.MockedFunction<
      typeof supabase.auth.getSession
    >;
    const mockGetUser = supabase.auth.getUser as jest.MockedFunction<
      typeof supabase.auth.getUser
    >;
    const mockSignOut = supabase.auth.signOut as jest.MockedFunction<
      typeof supabase.auth.signOut
    >;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('セッションが存在しない場合、falseを返す', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await checkSession();

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it('セッションが存在し、ユーザーが有効な場合、trueを返す', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123' },
      };
      const mockUser = { id: 'user-123' };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const result = await checkSession();

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('セッションは存在するが、ユーザー取得でエラーが発生した場合、サインアウトしてfalseを返す', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123' },
      };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Invalid token',
          name: 'AuthError',
          status: 401,
          code: 'invalid_token',
          __isAuthError: true,
        } as any,
      });
      mockSignOut.mockResolvedValue({ error: null });

      const result = await checkSession();

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('セッションは存在するが、ユーザーがnullの場合、サインアウトしてfalseを返す', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123' },
      };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null as any },
        error: null,
      });
      mockSignOut.mockResolvedValue({ error: null });

      const result = await checkSession();

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('匿名ユーザーの場合でも、有効なセッションとしてtrueを返す', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'anon-123', is_anonymous: true },
      };
      const mockUser = { id: 'anon-123', is_anonymous: true };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const result = await checkSession();

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    const mockRpc = supabase.rpc as jest.MockedFunction<typeof supabase.rpc>;
    const mockGetAllKeys = AsyncStorage.getAllKeys as jest.MockedFunction<
      typeof AsyncStorage.getAllKeys
    >;
    const mockMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<
      typeof AsyncStorage.multiRemove
    >;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('アカウント削除が成功し、AsyncStorageをクリアする', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });
      mockGetAllKeys.mockResolvedValue([
        'supabase.auth.token',
        'supabase.auth.session',
        'other.key',
      ]);
      mockMultiRemove.mockResolvedValue();

      await deleteAccount();

      expect(mockRpc).toHaveBeenCalledWith('delete_user_account');
      expect(mockGetAllKeys).toHaveBeenCalledTimes(1);
      expect(mockMultiRemove).toHaveBeenCalledWith([
        'supabase.auth.token',
        'supabase.auth.session',
      ]);
    });

    it('Supabaseキーが存在しない場合、multiRemoveを呼ばない', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });
      mockGetAllKeys.mockResolvedValue(['other.key', 'another.key']);

      await deleteAccount();

      expect(mockRpc).toHaveBeenCalledWith('delete_user_account');
      expect(mockGetAllKeys).toHaveBeenCalledTimes(1);
      expect(mockMultiRemove).not.toHaveBeenCalled();
    });

    it('RPC呼び出しでエラーが発生した場合、InfraErrorをスローする', async () => {
      const mockError = {
        message: 'Unauthorized',
        code: 'P0001',
      };
      mockRpc.mockResolvedValue({ data: null, error: mockError as any });

      await expect(deleteAccount()).rejects.toThrow('Failed to delete account');
      expect(mockRpc).toHaveBeenCalledWith('delete_user_account');
      expect(mockGetAllKeys).not.toHaveBeenCalled();
      expect(mockMultiRemove).not.toHaveBeenCalled();
    });
  });
});
