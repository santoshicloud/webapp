// const { sequelize } = require('../models/userModel');
// const supertest = require('supertest');
// const chai = require('chai');
// const app = require('../app');
// const expect = chai.expect;

// const request = supertest(app);

// describe('User Endpoint Integration Tests', () => {
//   let userId;
//   let userEmail;
//   let userPassword;

//   it('Test 1: should create a user and validate account creation', async () => {
//     const userData = {
//       email: 'sayali53@example.com',
//       password: 'TestPassword',
//       firstName: 'John',
//       lastName: 'Doe'
//     };

//     const createResponse = await request.post('/v1/user').send(userData);
//     expect(createResponse.status).to.equal(201); // 201 for successful user creation
//     userId = createResponse.body.id;
//     userEmail = userData.email;
//     userPassword = userData.password;

//     const getResponse = await request.get('/v1/user/self').set('Authorization', `Basic ${Buffer.from(`${userEmail}:${userPassword}`).toString('base64')}`);
//     expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
//     expect(getResponse.body.id).to.equal(userId);
//   });

//   it('Test 2: should update the user and validate the updates', async () => {
//     const updateData = {
//       firstName: 'UpdatedFirstName',
//       lastName: 'UpdatedLastName',
//       password: 'NewSecurePassword123'
//     };

//     const updateResponse = await request.put('/v1/user/self')
//       .send(updateData)
//       .set('Authorization', `Basic ${Buffer.from(`${userEmail}:${userPassword}`).toString('base64')}`);

//     expect(updateResponse.status).to.equal(200); // 200 for successful user update

//     const getResponse = await request.get('/v1/user/self').set('Authorization', `Basic ${Buffer.from(`${userEmail}:${updateData.password}`).toString('base64')}`);
//     expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
//     expect(getResponse.body.firstName).to.equal(updateData.firstName);
//     expect(getResponse.body.lastName).to.equal(updateData.lastName);
//   });
// });



const request = require('supertest');
const app = require('../app'); // Adjust the path as needed
const { sequelize } = require('../models/userModel'); // adjust the path as needed


beforeAll(async () => {
    await sequelize.sync({ force: true });
    console.log('Database schema synchronized successfully.');
});

afterAll(async () => {
    await sequelize.close();
    console.log('Database connection closed.');
});

describe('User API Integration Tests', () => {
    let createdUserId;

    // Define user details
    const userCredentials = {
        email: 'donga@example.com', //change here
        password: 'passwordlod123', //change here
        firstName: 'donga', //change here
        lastName: 'User'
    };

    // Test 1: Create an account and validate account creation
    it('should create an account and validate account creation', async () => {
        // Create user
        const createResponse = await request(app)
            .post('/v2/user')
            .send(userCredentials);
        expect(createResponse.statusCode).toBe(201);
        expect(createResponse.body).toHaveProperty('id');
        createdUserId = createResponse.body.id;

        // Validate account creation
        const validateResponse = await request(app)
            .get('/v2/user/self')
            .auth(userCredentials.email, userCredentials.password); // Basic Auth
        expect(validateResponse.statusCode).toBe(200);
        expect(validateResponse.body.id).toBe(createdUserId);
    });

    // Test 2: Update the account and validate the account was updated
    it('should update the account and validate the account was updated', async () => {
        const updatedUser = {
          firstName: 'donga', // Change this value,
            lastName: userCredentials.lastName // Keep original value
        };

        // Update user
        const updateResponse = await request(app)
            .put('/v2/user/self')
            .auth(userCredentials.email, userCredentials.password) // Basic Auth
            .send(updatedUser);
        expect(updateResponse.statusCode).toBe(204);

        // Validate account update
        const validateUpdateResponse = await request(app)
            .get('/v2/user/self')
            .auth(userCredentials.email, userCredentials.password); // Basic Auth
        expect(validateUpdateResponse.statusCode).toBe(200);
        expect(validateUpdateResponse.body.firstName).toBe(updatedUser.firstName);
        expect(validateUpdateResponse.body.lastName).toBe(updatedUser.lastName);
    });
});
