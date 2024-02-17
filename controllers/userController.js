// controllers/userController.js

const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');
const { sequelize } = require('../models/userModel');
const { Op } = require('sequelize');
const UserModel = require('../models/userModel'); // Ensure you have this line to import the UserModel
const { v4: uuidv4 } = require('uuid');


exports.createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    console.log("Creating user with email:", email);
    
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password securely with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully for user:", email);

    // Set current time for account creation and update
    const currentTime = new Date();

    // Create the user in the database
    console.log("Creating user in the database:", email);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      account_created: currentTime,
    });
    console.log("User created successfully:", email);

    // Respond with the user information
    const id = uuidv4();
    res.status(201).json({ 
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: "An error occurred while creating the user." });
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

    // Compare provided password with stored password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Return user information if authentication is successful
    const id = uuidv4(); // Generate a new UUID
    res.status(200).json({ 
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      account_created: user.account_created,
      account_updated: user.account_updated
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    res.status(400).json({ error: "An error occurred while retrieving user information." });
  }
}; // Add this closing brace



exports.updateUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ error: "Basic Authentication credentials not provided" });
    }

    // Extract and decode the credentials from the Authorization header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const userEmail = credentials.split(':')[0]; // Assuming username is email

    // Find the user in the database
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the user is updating their own account
    if (user.email !== userEmail) {
      return res.status(403).json({ error: "Unauthorized to update this user's account information" });
    }

    // Proceed with updating user information
    const { firstName, lastName, password } = req.body;
    const allowedFields = ['firstName', 'lastName', 'password'];
    
    // Check if any other field is present in the request body
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Updating ${invalidFields.join(', ')} is not allowed` });
    }

    // Update user information if allowed fields are provided
    let isUpdated = false;
    if (firstName && user.firstName !== firstName) {
      user.firstName = firstName;
      isUpdated = true;
    }
    if (lastName && user.lastName !== lastName) {
      user.lastName = lastName;
      isUpdated = true;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
      isUpdated = true;
    }

    // If any field is updated, save changes and respond with updated user information
    if (isUpdated) {
      user.account_updated = new Date();
      await user.save();
      return res.status(200).json({ 
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        account_created: user.account_created,
        account_updated: user.account_updated
      });
    } else {
      // If no fields are updated, return a success response without updating
      return res.status(204).send();
    }
  } catch (error) {
    console.error("Error updating user information:", error);
    return res.status(500).json({ error: "An error occurred while updating user information." });
  }
};
