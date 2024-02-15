// app.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const { sequelize } = require('./models/userModel');


app.use(express.json()); //using to parse JSON body
app.use('/v1/user', userRoutes);


// Bootstrap the database
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

bootstrapDatabase(); // Call the function to bootstrap the database

// Handle GET request for /healthz endpoint
app.get('/healthz', async (req, res) => {
  try {
    // Check if the database connection is established
    await sequelize.authenticate();
    // If the connection is successful, respond with 200 OK
    res.status(200).json({ status: 'OK' });
  } catch (error) {
    // If the connection fails, respond with 503 Service Unavailable
    console.error('Error checking database health:', error);
    res.status(503).json({ error: 'Service Unavailable' });
  }
});

// Handle HEAD request for /healthz endpoint
app.head('/healthz', async (req, res) => {
  // Respond with 405 Method Not Allowed for HEAD requests
  res.status(405).end();
});

// Handle unsupported methods for all other endpoints
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }
  next();
});

if (!module.parent) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;