// models/userModel.js

const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator
require('dotenv').config();

// Initialize Sequelize with database connection details
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  define: {
    underscored: true, // Use snake_case for automatically generated attributes (e.g., createdAt, updatedAt)
  },
});

// Define the User model
const User = sequelize.define('user', {
  id: {
    type: Sequelize.UUID, // Use UUID data type for id
    defaultValue: Sequelize.UUIDV4, // Generate UUID by default
    primaryKey: true, // Make id the primary key ok
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
    allowNull: true, 
  },
  isEmailVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    field: 'is_email_verified'
  },
  mailSentAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  verificationLink: {
    type: Sequelize.STRING,
    defaultValue: null  // Changed from false to null
  }

});

// Add hook to update account_updated field before saving
User.beforeSave((user, options) => {
  user.account_updated = new Date(); 
});

module.exports = {
  sequelize,
  User,
};
//adding comment