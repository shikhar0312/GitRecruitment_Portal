module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        types: ['node', 'jest'],
      },
    },
  },
}