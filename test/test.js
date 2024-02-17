it('Test 2: should update the user and validate the updates', async function() {
  this.timeout(10000);

  // Define userData for this test case
  const userData = {
    email: 'sayali5@example.com', 
    password: 'TestPassword' 
  };

  const updateData = {
    firstName: 'UpdatedFirstName',
    lastName: 'UpdatedLastName',
    newPassword: 'NewSecurePassword123' // Provide a new password for update
  };

  const updateResponse = await request.put('/v1/user/self')
    .send(updateData)
    .set('Authorization', `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`); // Use userData credentials
  expect(updateResponse.status).to.equal(200); // 200 for successful user update

  // Use the new password for retrieving user information
  const getResponse = await request.get('/v1/user/self').set('Authorization', `Basic ${Buffer.from(`${userData.email}:${updateData.newPassword}`).toString('base64')}`);
  expect(getResponse.status).to.equal(200); // 200 for successful user retrieval
  expect(getResponse.body.firstName).to.equal('UpdatedFirstName');
  expect(getResponse.body.lastName).to.equal('UpdatedLastName');
});
