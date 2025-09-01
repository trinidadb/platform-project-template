import type { Config } from 'jest';

/**
 * This is the base Jest configuration.
 * It contains settings that are common to both unit and integration tests.
 */
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,

  // --- Code Coverage Configuration ---
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',        // Exclude the main entry point
    '!src/config/**',       // and all config files
    '!src/tests/**',        // Exclude test setup files
  ],
};

export default config;
