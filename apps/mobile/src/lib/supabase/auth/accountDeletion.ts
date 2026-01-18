import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../client';
import { InfraError, InfraErrorCode } from '@/lib/errors';

/**
 * アカウントを削除
 * ユーザーデータとアカウントを完全に削除
 */
export async function deleteAccount(): Promise<void> {
  // データベース関数を呼び出してアカウントを削除
  // パラメータなし（auth.uid()を使用）
  const { error } = await supabase.rpc('delete_user_account');

  if (error) {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'Failed to delete account',
      error
    );
  }

  // 削除成功後、AsyncStorageから直接セッションデータを完全に削除
  // auth.usersが既に削除されているため、通常のsignOut()は失敗する
  const keys = await AsyncStorage.getAllKeys();
  const supabaseKeys = keys.filter(key => key.startsWith('supabase.auth.'));
  if (supabaseKeys.length > 0) {
    await AsyncStorage.multiRemove(supabaseKeys);
  }
}
