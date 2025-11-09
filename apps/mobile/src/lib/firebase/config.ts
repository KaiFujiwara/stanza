import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Firebase設定
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

const shouldUseEmulator =
  ((Constants.expoConfig?.extra as { firebaseUseEmulator?: unknown })?.firebaseUseEmulator ??
    true) !== false;

const emulatorHost =
  (Constants.expoConfig?.extra as { firebaseEmulatorHost?: string })?.firebaseEmulatorHost?.trim() ??
  '';

// Firebase初期化（重複初期化を防ぐ）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// エミュレーター接続フラグ
let emulatorInitialized = false;

const connectEmulatorsIfNeeded = async (): Promise<void> => {
  if (!shouldUseEmulator || emulatorInitialized) {
    return;
  }

  if (!emulatorHost) {
    throw new Error(
      'FIREBASE_EMULATOR_HOST is not defined. Set it to your dev machine IP when FIREBASE_USE_EMULATOR=true.'
    );
  }

  connectFirestoreEmulator(db, emulatorHost, 8080);
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  emulatorInitialized = true;
  console.log(`🔥 Firebase Emulator connected via ${emulatorHost}`);
};

/**
 * Firebaseの初期化処理
 * - 開発環境: エミュレーターに接続
 * - 匿名認証でユーザーをサインイン
 */
export const initializeFirebase = async (): Promise<void> => {
  try {
    await connectEmulatorsIfNeeded();

    // 匿名認証（既にログイン済みでなければ）
    if (!auth.currentUser) {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Anonymous user signed in:', userCredential.user.uid);
    } else {
      console.log('✅ User already signed in:', auth.currentUser.uid);
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

/**
 * 現在のユーザーIDを取得
 * @returns ユーザーID
 * @throws ユーザーが認証されていない場合
 */
export const getCurrentUserId = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User not authenticated');
  }
  return uid;
};

/**
 * Firestoreインスタンス
 */
export { db };

/**
 * Authenticationインスタンス
 */
export { auth };
