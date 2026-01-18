import { supabase } from '../client';
import { InfraError, InfraErrorCode } from '@/lib/errors';

/**
 * サインアウト
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new InfraError(
      InfraErrorCode.SIGN_OUT_FAILED,
      'Sign out operation failed',
      error
    );
  }
}
