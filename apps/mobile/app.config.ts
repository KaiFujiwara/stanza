import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_ENV === 'development';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.somedon.lyricsnotes.dev';
  return 'com.somedon.lyricsnotes';
};

const getAppName = () => {
  if (IS_DEV) return 'Stanza (Dev)';
  return 'Stanza';
};

const shouldUseEmulator = () => {
  const value = process.env.FIREBASE_USE_EMULATOR;
  if (value === undefined) return true;
  return value.toLowerCase() !== 'false';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'lyrics_notes',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'lyricsnotes',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      NSLocalNetworkUsageDescription:
        'Allows the app to connect to the Firebase Emulator running on your development machine.',
    },
  },
  android: {
    package: getUniqueIdentifier(),
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
  ],
  extra: {
    eas: {
      projectId: 'a3470b0c-5831-4f10-955d-4245bafa1123',
    },
    env: process.env.APP_ENV || 'production',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    // アプリ設定
    appName: 'Stanza',
    supportEmail: 'support@example.com', // TODO: 実際のメールアドレスに変更
  },
  owner: 'somedon',
});
