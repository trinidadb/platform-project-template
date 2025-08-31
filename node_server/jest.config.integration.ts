import type { Config } from 'jest';

const config: Config = {
    displayName: 'Integration Tests',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/integration/**/*.test.ts'], // Only run files in the integration/ folder
    setupFilesAfterEnv: ['./src/tests/setup.ts'], // Run the DB setup
    clearMocks: true,
};

export default config;
    
