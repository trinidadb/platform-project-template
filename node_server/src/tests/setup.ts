import { postgresDbConnector } from '../connectors'; // Adjust path if needed
import { User } from '../models'; // Import all your models

// Increase Jest's default timeout for database operations
jest.setTimeout(30000);

beforeAll(async () => {
  try {
    // Connect to the test database and sync models
    await postgresDbConnector.authenticate();
    // Use `force: true` to drop all tables and recreate them, ensuring a clean state
    await postgresDbConnector.sync({ force: true });
    console.log('Test database connected and synced.');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    process.exit(1);
  }
});

beforeEach(async () => {
  // Truncate all tables before each test
  // This is faster than dropping them every time
  try {
    await User.destroy({ where: {}, truncate: true, cascade: true });
    // Add a destroy command for every model you have
  } catch (error) {
    console.error('Failed to clear tables before test:', error);
  }
});

afterAll(async () => {
  // Close the database connection after all tests are done
  try {
    await postgresDbConnector.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Failed to close test database connection:', error);
  }
});
