import { ConfigContext, ExpoConfig } from 'expo/config';

const APP_ENV = process.env.APP_ENV;

const getUniqueIdentifier = () => {
  if (APP_ENV === 'development') return 'com.somedon.stanza.dev';
  if (APP_ENV === 'preview') return 'com.somedon.stanza.preview';
  return 'com.somedon.stanza';
};

const getAppName = () => {
  if (APP_ENV === 'development') return 'Stanza (Dev)';
  if (APP_ENV === 'preview') return 'Stanza (Preview)';
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
  slug: 'stanza',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'stanza',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  icon: './assets/images/icon.png',
  splash: {
    image: './assets/images/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#E6F4FE',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    icon: './assets/images/icon.png',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      NSLocalNetworkUsageDescription:
        'Allows the app to connect to the Firebase Emulator running on your development machine.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#E6F4FE',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: getUniqueIdentifier(),
  },
  web: {
    output: 'static',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/icon.png',
        resizeMode: 'contain',
        backgroundColor: '#33BC55',
        dark: {
          image: './assets/images/icon.png',
          resizeMode: 'contain',
          backgroundColor: '#33BC55',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '42e7dcd9-df01-4b13-b787-8fa9756e0385',
    },
    // アプリ設定
    appName: 'Stanza',
    supportEmail: 'stanza.app.contact@gmail.com',
  },
  owner: 'somedon',
});
