const supertest = require('supertest');
const chai = require('chai');
const app = require('../app');
const expect = chai.expect;

const request = supertest(app);
const userPassword = 'TestPassword';

describe('User Endpoint Integration Tests', () => {
  let userId;
  let userEmail;
  let userPassword;

  it('Test 1: should create a user and validate account creation', async () => {
    const userData = {
      email: 'sayali11@example.com',
      password: 'TestPassword',
      firstName: 'John',
      lastName: 'Doe'
    };

    const createResponse = await request.post('/v1/user').send(userData);
    expect(createResponse.status).to.equal(201); // 201 for successful user creation
    userId = createResponse.body.id;
    userEmail = userData.email;
    userPassword = userData.password;

    const getResponse = await request.get('/v1/user/self').set('Authorization', `Basic ${Buffer.from(`${userEmail}:${userPassword}`).toString('base64')}`);
    expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
    expect(getResponse.body.id).to.equal(userId);
  });

  it('Test 2: should update the user and validate the updates', async () => {
    const updateData = {
      firstName: 'UpdatedFirstName',
      lastName: 'UpdatedLastName',
      password: 'NewSecurePassword123'
    };

    const updateResponse = await request.put('/v1/user/self')
      .send(updateData)
      .set('Authorization', `Basic ${Buffer.from(`${userEmail}:${userPassword}`).toString('base64')}`);

    expect(updateResponse.status).to.equal(200); // 200 for successful user update

    const getResponse = await request.get('/v1/user/self').set('Authorization', `Basic ${Buffer.from(`${userEmail}:${updateData.password}`).toString('base64')}`);
    expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
    expect(getResponse.body.firstName).to.equal(updateData.firstName);
    expect(getResponse.body.lastName).to.equal(updateData.lastName);
  });
});
