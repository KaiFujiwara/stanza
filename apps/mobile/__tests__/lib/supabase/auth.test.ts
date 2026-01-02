import { supabase } from '@/lib/supabase/client';

// Expo関連のモジュールをモック
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'stanza://auth/callback'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
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
  },
}));

// checkSessionをインポート（モックの後に）
import { checkSession } from '@/lib/supabase/auth';

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
});
