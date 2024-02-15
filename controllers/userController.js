// controllers/userController.js

const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');
const { sequelize } = require('../models/userModel');
const { Op } = require('sequelize');


exports.createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    // Hash the password securely with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      account_created: new Date(),
    });

    res.status(201).json({ 
      message: "User created successfully.",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        account_created: user.account_created
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An error occurred while creating the user." });
  }
};

exports.getUserInfo = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(400).json({ error: "Basic Authentication credentials not provided" });
  }
  // Extract the base64 encoded credentials from the Authorization header
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  // Split the credentials into username and password
  const [username, password] = credentials.split(':');
  // Assuming username is the user's email address
  const userEmail = username;
  try {
    // Query the database to retrieve user information based on the email
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ 
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        account_created: user.account_created,
        account_updated: user.account_updated
      }
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    res.status(500).json({ error: "An error occurred while retrieving user information." });
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ error: "Basic Authentication credentials not provided" });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const userEmail = credentials.split(':')[0]; // Assuming username is email

    const { firstName, lastName, password } = req.body;
    const allowedFields = ['firstName', 'lastName', 'password'];

    // Check if any other field is present in the request body
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Updating ${invalidFields.join(', ')} is not allowed` });
    }

    // Find the user in the database
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the user is updating their own account
    if (user.email !== userEmail) {
      return res.status(403).json({ error: "Unauthorized to update this user's account information" });
    }

    // Update user information
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) user.password = await bcrypt.hash(password, 10);

    // Set account_updated to current timestamp
    user.account_updated = new Date();

    // Save the updated user
    await user.save();

    res.status(200).json({ 
      message: "User information updated successfully.",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        account_created: user.account_created,
        account_updated: user.account_updated
      }
    });
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ error: "An error occurred while updating user information." });
  }
};
