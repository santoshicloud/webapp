const request = require('supertest');
const app = require('../app'); // Adjust the path as needed

describe('User API Integration Tests', () => {
    let createdUserId;

    // Define user details
    const userCredentials = {
        email: 'Rao@example.com',
        password: 'password123',
        firstName: 'Rao',
        lastName: 'User'
    };

    // Test 1: Create an account and validate account creation
    it('should create an account and validate account creation', async () => {
        // Create user
        const createResponse = await request(app)
            .post('/v1/user')
            .send(userCredentials);
        expect(createResponse.statusCode).toBe(201);
        expect(createResponse.body).toHaveProperty('id');
        createdUserId = createResponse.body.id;

        // Validate account creation
        const validateResponse = await request(app)
            .get('/v1/user/self')
            .auth(userCredentials.email, userCredentials.password); // Basic Auth
        expect(validateResponse.statusCode).toBe(200);
        expect(validateResponse.body.id).toBe(createdUserId);
    });

    // Test 2: Update the account and validate the account was updated
    it('should update the account and validate the account was updated', async () => {
        const updatedUser = {
          firstName: 'Tap', // Change this value,
            lastName: userCredentials.lastName // Keep original value
        };

        // Update user
        const updateResponse = await request(app)
            .put('/v1/user/self')
            .auth(userCredentials.email, userCredentials.password) // Basic Auth
            .send(updatedUser);
        expect(updateResponse.statusCode).toBe(200);

        // Validate account update
        const validateUpdateResponse = await request(app)
            .get('/v1/user/self')
            .auth(userCredentials.email, userCredentials.password); // Basic Auth
        expect(validateUpdateResponse.statusCode).toBe(200);
        expect(validateUpdateResponse.body.firstName).toBe(updatedUser.firstName);
        expect(validateUpdateResponse.body.lastName).toBe(updatedUser.lastName);
    });
});
