import type { Config } from 'jest';

/**
 * This is the main Jest configuration file.
 * It uses the "projects" feature to run different test suites
 * with completely separate configurations.
 */
const config: Config = {
  // A list of paths to the configuration files for each test project.
  projects: [
    '<rootDir>/jest.config.unit.ts',
    '<rootDir>/jest.config.integration.ts',
  ],
};

export default config;