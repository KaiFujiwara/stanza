import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_ENV === 'development';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.somedon.lyricsnotes.dev';
  return 'com.somedon.lyricsnotes';
};

const getAppName = () => {
  if (IS_DEV) return 'Lyrics Notes (Dev)';
  return 'Lyrics Notes';
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
  ],
  extra: {
    eas: {
      projectId: 'a3470b0c-5831-4f10-955d-4245bafa1123',
    },
    env: process.env.APP_ENV || 'production',
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    firebaseUseEmulator: shouldUseEmulator(),
    firebaseEmulatorHost: process.env.FIREBASE_EMULATOR_HOST,
  },
  owner: 'somedon',
});
