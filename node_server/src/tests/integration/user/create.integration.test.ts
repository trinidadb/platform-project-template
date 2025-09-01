import request from 'supertest';
import { Application } from '../../../app'; // Import your app class
import { User } from '../../../models'; // Import your User model

const app = new Application().app;

describe('User API', () => {
  
  describe('POST /users/create', () => {

    it('should create a new user and return it with a 201 status code', async () => {
      // Arrange: Define the data for the new user
      const userData = {
        name: 'Random User',
        email: 'random@example.com',
        birth_date: '1990-01-15',
      };

      // Act: Make the HTTP request to the endpoint
      const response = await request(app)
        .post('/users/create')
        .send(userData);

      // Assert: Check the HTTP response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);

      // Assert: Check the database state directly
      const createdUser = await User.findOne({ where: { email: userData.email } });
      expect(createdUser).not.toBeNull();
      console.log(createdUser)
      //expect(createdUser?.name).toBe(userData.name);
    });

    it('should return a 400 error if required fields -email- is missing', async () => {
        // Arrange: Missing the 'email' field
        const invalidUserData = {
            name: 'Random User',
            birth_date: '1995-05-20'
        };

        // Act
        const response = await request(app)
            .post('/users/create')
            .send(invalidUserData);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Missing required fields');
    });

  });

});
