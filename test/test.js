const supertest = require('supertest');
const chai = require('chai');
const app = require('../app'); // Ensure this is the path to your Express app initialization
const expect = chai.expect;

const request = supertest(app);

describe('User Endpoint Integration Tests', () => {
  let userId;

  it('Test 1: should create a user and validate account creation', async function() {
    this.timeout(10000);

    const userData = {
      email: 'sayali@example.com',
      password: 'TestPassword123',
      firstName: 'John',
      lastName: 'Doe'
    };

    let createResponse = await request.post('/v1/user').send(userData);
    expect(createResponse.status).to.equal(201); // 201 for successful user creation
    userId = createResponse.body.id; // Assuming response contains user id

    const getResponse = await request.get(`/v1/user/self`).set('Authorization', `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`);
    expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
    expect(getResponse.body.id).to.equal(userId);
  });

  it('Test 2: should update the user and validate the updates', async function() {
    this.timeout(10000);

    const updateData = {
      firstName: 'UpdatedFirstName',
      lastName: 'UpdatedLastName',
      password: 'NewSecurePassword123'
    };

    const updateResponse = await request.put('/v1/user/self')
      .send(updateData)
      .set('Authorization', `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`); // Use userData credentials
    expect(updateResponse.status).to.equal(200); // 200 for successful user update

    const getResponse = await request.get('/v1/user/self').set('Authorization', `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`); // Use userData credentials
    expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
    expect(getResponse.body.firstName).to.equal('UpdatedFirstName');
    expect(getResponse.body.lastName).to.equal('UpdatedLastName');
  });
});
