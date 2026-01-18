import { linkGoogleIdentity } from '@/lib/supabase/auth';

/**
 * Googleアカウントをリンクするユースケース
 */
export class LinkGoogleAccountUseCase {
  async execute(): Promise<void> {
    await linkGoogleIdentity();
  }
}

export const linkGoogleAccountUseCase = new LinkGoogleAccountUseCase();
