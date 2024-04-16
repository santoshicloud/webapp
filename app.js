require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const winston = require('winston');
const app = express();
const userRoutes = require('./routes/userRoutes');
const { sequelize } = require('./models/userModel');
const logger = require('./logger');

// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

app.use(express.json()); // Using to parse JSON body
app.use('/v2/user', userRoutes);

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

// If app.js is being run directly (not imported by a test file), then start the server
if (!module.parent) {
  const PORT = process.env.PORT || 3000;
  bootstrapDatabase(); // Call the function to bootstrap the database

  // Handle GET request for /healthz endpoint
  app.get('/healthz', async (req, res) => {
    try {
      // Check if the database connection is established
      await sequelize.authenticate();
      // If the connection is successful, respond with 200 OK
      res.status(200).json({ status: 'OK' });
      logger.info('Health check passed');
    } catch (error) {
      // If the connection fails, respond with 503 Service Unavailable
      logger.error('Error checking database health:', error);
      res.status(503).json({ error: 'Service Unavailable' });
    }
  });

  // Handle HEAD request for /healthz endpoint
  app.head('/healthz', async (req, res) => {
    // Respond with 405 Method Not Allowed for HEAD requests
    res.status(405).end();
    logger.warn('HEAD request to /healthz not supported');
  });

  // Handle unsupported methods for all other endpoints
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      logger.warn('Unsupported request method:', req.method);
      return res.status(405).end();
    }
    next();
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
//adding for comment