module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['.integration.test.ts$'],
  moduleNameMapper: {
    '^@lyrics-notes/core(.*)$': '<rootDir>/src$1',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
