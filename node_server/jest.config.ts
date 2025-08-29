export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  clearMocks: true, // Limpia los mocks automáticamente después de cada test

  // --- Added for Code Coverage ---
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts", //  Exclude the main entry point
    "!src/config/**", // and config files
  ],
};