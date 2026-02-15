/**
 * Jest configuration for Acquisitions API.
 * @see https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // Set NODE_ENV to test
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },

  // Clear mocks between tests for isolation
  clearMocks: true,

  // Reset mocks after each test
  resetMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Collect coverage information
  collectCoverage: true,

  // Files to include in coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/server.js',
    '!src/config/database.js',
    '!src/config/arcjet.js',
  ],

  // Coverage output directory
  coverageDirectory: 'coverage',

  // Coverage thresholds - fail if below these percentages
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Use V8 for coverage
  coverageProvider: 'v8',

  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: ['**/tests/**/*.test.js'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],

  // Timeout for tests (10 seconds)
  testTimeout: 10000,

  // Show verbose output
  verbose: true,
};

export default config;
