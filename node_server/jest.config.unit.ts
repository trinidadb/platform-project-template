import type { Config } from 'jest';

const config: Config = {
    displayName: 'Unit Tests',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/unit/**/*.test.ts'], // Only run files in the unit/ folder
    clearMocks: true,
};

export default config;
