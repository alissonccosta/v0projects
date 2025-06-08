module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/src/__tests__/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['./jest.setup.js']
};
