import { toUserMessage } from '@/lib/errors/errorHandler';
import { InfraError, InfraErrorCode } from '@/lib/errors/InfraError';
import { DomainError, ErrorCode } from '@stanza/core';

describe('errorHandler', () => {
  describe('toUserMessage', () => {
    describe('InfraError', () => {
      it('AUTH_FAILEDの場合、適切なユーザーメッセージを返す', () => {
        const error = new InfraError(
          InfraErrorCode.AUTH_FAILED,
          'Authentication failed'
        );
        const result = toUserMessage(error);

        expect(result.userMessage).toBe(
          'ログインに失敗しました。しばらく時間をおいてからお試しください。'
        );
        expect(result.devMessage).toBe('Authentication failed');
      });

      it('AUTH_CANCELLEDの場合、適切なユーザーメッセージを返す', () => {
        const error = new InfraError(
          InfraErrorCode.AUTH_CANCELLED,
          'User cancelled authentication'
        );
        const result = toUserMessage(error);

        expect(result.userMessage).toBe('ログインがキャンセルされました。');
        expect(result.devMessage).toBe('User cancelled authentication');
      });

      it('AUTH_SESSION_INVALIDの場合、適切なユーザーメッセージを返す', () => {
        const error = new InfraError(
          InfraErrorCode.AUTH_SESSION_INVALID,
          'Session is invalid'
        );
        const result = toUserMessage(error);

        expect(result.userMessage).toBe(
          '認証情報の取得に失敗しました。再度ログインしてください。'
        );
        expect(result.devMessage).toBe('Session is invalid or expired');
      });

      it('SIGN_OUT_FAILEDの場合、適切なユーザーメッセージを返す', () => {
        const error = new InfraError(
          InfraErrorCode.SIGN_OUT_FAILED,
          'Sign out failed'
        );
        const result = toUserMessage(error);

        expect(result.userMessage).toBe(
          'ログアウトに失敗しました。しばらく時間をおいてからお試しください。'
        );
        expect(result.devMessage).toBe('Sign out operation failed');
      });
    });

    describe('DomainError', () => {
      it('DomainErrorの場合、適切なユーザーメッセージを返す', () => {
        const error = new DomainError(ErrorCode.EMPTY_VALUE, 'Text is required');
        const result = toUserMessage(error);

        expect(result.userMessage).toBe('入力が必要です。内容を入力してから再度お試しください。');
        expect(result.devMessage).toBe('Validation failed: empty value');
      });

      it('未知のDomainErrorCodeの場合、汎用メッセージを返す', () => {
        const error = new DomainError('UNKNOWN_CODE' as any, 'Unknown domain error');
        const result = toUserMessage(error);

        expect(result.userMessage).toBe('エラーが発生しました');
        expect(result.devMessage).toContain('Unknown ErrorCode');
      });
    });

    describe('未知のエラー', () => {
      it('Errorオブジェクトの場合、汎用メッセージを返す', () => {
        const error = new Error('Unknown error');
        const result = toUserMessage(error);

        expect(result.userMessage).toBe(
          '通信エラーが発生しました。しばらくしてから再度お試しください。'
        );
        expect(result.devMessage).toBe('Unknown error');
      });

      it('文字列エラーの場合、汎用メッセージを返す', () => {
        const error = 'Something went wrong';
        const result = toUserMessage(error);

        expect(result.userMessage).toBe('エラーが発生しました');
        expect(result.devMessage).toBe('Something went wrong');
      });

      it('オブジェクトエラーの場合、汎用メッセージを返す', () => {
        const error = { code: 'UNKNOWN', message: 'Unknown error' };
        const result = toUserMessage(error);

        expect(result.userMessage).toBe('エラーが発生しました');
        expect(result.devMessage).toBe('[object Object]');
      });
    });
  });
});
