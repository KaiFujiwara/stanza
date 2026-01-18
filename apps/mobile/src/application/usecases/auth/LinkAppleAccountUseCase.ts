import { linkAppleIdentity } from '@/lib/supabase/auth';

/**
 * Appleアカウントをリンクするユースケース
 */
export class LinkAppleAccountUseCase {
  async execute(): Promise<void> {
    await linkAppleIdentity();
  }
}

export const linkAppleAccountUseCase = new LinkAppleAccountUseCase();
