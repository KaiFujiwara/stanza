module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/mockUuid.ts',
    '<rootDir>/__tests__/setup/mockSupabase.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'react-native-url-polyfill/auto': '<rootDir>/__tests__/setup/mockPolyfill.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-constants|expo-.*)/)'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,
    }],
  },
};