const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Adjust the path to your Express app
const expect = chai.expect;
const { sequelize } = require('./models/userModel');

chai.use(chaiHttp);

async function bootstrapDatabase() {
  try {
    await sequelize.authenticate(); // Test database connection
    console.log('Connection to the database has been established successfully.');

    // Synchronize database models with database schema
    await sequelize.sync({ alter: true }); // This will automatically create tables if they don't exist
    console.log('Database synchronized.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the application if unable to connect to the database
  }
}

bootstrapDatabase();

describe('User Integration Tests', () => {
  const userEmail = 'john111@example.com';
  const password = 'Passrd123!';
  const authHeader = 'Basic ' + Buffer.from(`${userEmail}:${password}`).toString('base64');

  it('Test 1: Create an account and validate account exists', (done) => {
    // Create user
    chai.request(app)
      .post('/v1/user')
      .send({ email: userEmail, password, firstName: 'Lesh', lastName: 'Knna' })
      .end((err, res) => {
        expect(res).to.have.status(201);

        // Basic Auth header for the created user
        const createdUserAuthHeader = 'Basic ' + Buffer.from(`${userEmail}:${password}`).toString('base64');

        // Validate account exists
        chai.request(app)
          .get('/v1/user/self')
          .set('Authorization', createdUserAuthHeader)
          .end((err, res) => {
            expect(res).to.have.status(500);
            expect(res.body.user).to.include({
              email: userEmail,
              firstName: 'Lesh',
              lastName: 'Knna'
            });
            done();
          });
      });
  });

  it('Test 2: Update the account and validate the account was updated', (done) => {
    // Update user information
    chai.request(app)
      .put('/v1/user/self')
      .set('Authorization', authHeader)
      .send({ firstName: 'Updated', lastName: 'Knna' })
      .end((err, res) => {
        expect(res).to.have.status(200);

        // Validate account was updated
        chai.request(app)
          .get('/v1/user/self')
          .set('Authorization', authHeader)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.user).to.include({
              email: userEmail,
              firstName: 'Updated',
              lastName: 'Knna'
            });
            done();
          });
      });
  });
});
