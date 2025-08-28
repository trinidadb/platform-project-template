export default {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"], // Ruta a los archivos de pruebas
    moduleFileExtensions: ["js", "ts"],
    clearMocks: true, // Limpia los mocks automáticamente después de cada test
  };