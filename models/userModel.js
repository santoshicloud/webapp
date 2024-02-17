// models/userModel.js

const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator
const { Pool } = require('pg')
// Load environment variables from .env file
require('dotenv').config();

// Initialize Sequelize with database connection details
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  define: {
    underscored: true, // Use snake_case for automatically generated attributes (e.g., createdAt, updatedAt)
  },
});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Define the User model
const User = sequelize.define('user', {
  id: {
    type: Sequelize.UUID, // Use UUID data type for id
    defaultValue: Sequelize.UUIDV4, // Generate UUID by default
    primaryKey: true, // Make id the primary key
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  account_created: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  account_updated: {
    type: Sequelize.DATE,
    allowNull: true, // Allow null initially
  },
});

// Add hook to update account_updated field before saving
User.beforeSave((user, options) => {
  user.account_updated = new Date(); // Update account_updated field before saving
});

module.exports = {
  sequelize,
  User,
};
