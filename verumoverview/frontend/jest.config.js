module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  testMatch: ['**/src/__tests__/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: './tsconfig.json'
    }
  }
};
