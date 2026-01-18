/**
 * Auth module
 * すべての認証関連機能を統合してエクスポート
 */

// Sign In
export { signInAnonymously, signInWithApple, signInWithGoogle } from './signIn';

// Sign Out
export { signOut } from './signOut';

// Session
export { checkSession, getCurrentUserId } from './session';

// Account Linking
export { linkAppleIdentity, linkGoogleIdentity } from './accountLinking';

// Account Deletion
export { deleteAccount } from './accountDeletion';
