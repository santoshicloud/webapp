// controllers/userController.js

const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
const { PubSub } = require('@google-cloud/pubsub');
const { addMinutes } = require('date-fns');


const pubSubClient = new PubSub({
  projectId: process.env.cloud_project
});

// publishVerificationMessage function
async function publishVerificationMessage(userId, email, firstName, lastName) {
  const token = userId;
  console.log(`Verification token for user ${email}: ${token}`); // Added print statement for the token
  const expiresTime = addMinutes(new Date(), 2);
  await User.update({ verificationToken: token, tokenExpiry: expiresTime }, { where: { id: userId } });

  // const verificationLink = `https://santoshicloud.me:3000/verify?token=${token}`;
  const verificationLink = `http://santoshicloud.me:3000/v1/user/verify?token=${token}`;

  const messageData = JSON.stringify({
      userId,
      email,
      fullName: `${firstName} ${lastName}`,
      verificationLink
  });
  const message = {
      data: Buffer.from(messageData),
  };
  try {
      await pubSubClient.topic('projects/devproject-414823/topics/verify_email').publishMessage(message);
      logger.info(`Verification email message published for user ${email}`);
      console.log('sent')
  } catch (error) {
      logger.error(`Failed to publish verification email message for user ${userId}`, error);
      console.log(error)
  }
}

exports.createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    logger.warn('Create User: Missing required fields');
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    logger.info(`Create User: Attempting to create user with email: ${email}`);
    
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Create User: User already exists with email: ${email}`);
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password securely with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.info(`Create User: Password hashed for user: ${email}`);

    // Set current time for account creation and update
    const currentTime = new Date();

    // Create the user in the database
    logger.info(`Create User: Creating user in the database with email: ${email}`);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      account_created: currentTime,
    });
    logger.info(`Create User: User created successfully with email: ${email}`);
    console.log(`User created with UUID: ${user.id}`);

    await publishVerificationMessage(user.id, email, firstName, lastName); 
    await user.update({ mailSentAt: new Date() });


    // Respond with the user information
    // const id = uuidv4();
    // logger.info(`Create User: UUID generated for user: ${id}`);
    res.status(201).json({ 
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (error) {
    logger.warn(`Create User: Error creating user with email: ${email}`, error);
    res.status(400).json({ error: "An error occurred while creating the user." });
  }
};




exports.verifyUser = async (req, res) => {
  // const token = req.params.token;
  const token = req.query.token;
  console.log(token);

  if (!token) {
    return res.status(400).json({ error: "Verification token is required." });
  }

  try {
    const user = await User.findOne({ where: { id: token } } );
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found or token expired." });
    }

    // Check if the token is expired
    const currentTime = new Date();
    if (currentTime > user.tokenExpiry) {
      return res.status(400).json({ error: "Verification token has expired." });
    }

    // Update user to verified
    // await user.update({ isEmailVerified: true, verificationToken: null, tokenExpiry: null });
    user.is_email_verified = true;
    await user.save();
    console.log(user);
    res.status(200).json({ message: "Email successfully verified" });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify email." });
  }
};



exports.getUserInfo = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    logger.warn('Get User Info: Basic Authentication credentials not provided');
    return res.status(400).json({ error: "Basic Authentication credentials not provided" });
  }
  // Extract the base64 encoded credentials from the Authorization header
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  // Split the credentials into username and password
  const [username, password] = credentials.split(':');
  
  const userEmail = username;
  try {
    // Query the database to retrieve user information based on the email
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      logger.warn(`Get User Info: User not found with email: ${userEmail}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Compare provided password with stored password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn('Get User Info: Authentication failed');
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Return user information if authentication is successful
    // const id = uuidv4(); // Generate a new UUID
    // logger.info(`Create User: UUID generated for user: ${id}`);
    res.status(200).json({ 
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      account_created: user.account_created,
      account_updated: user.account_updated
    });
  } catch (error) {
    logger.warn('Get User Info: Error retrieving user information', error);
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
      logger.warn(`Update User Info: User not found with email: ${userEmail}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the user is updating their own account
    if (user.email !== userEmail) {
      logger.warn('Update User Info: Unauthorized to update this user\'s account information');
      return res.status(403).json({ error: "Unauthorized to update this user's account information" });
    }

    // Proceed with updating user information
    const { firstName, lastName, password } = req.body;
    const allowedFields = ['firstName', 'lastName', 'password'];
    
    // Check if any other field is present in the request body
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      logger.warn(`Update User Info: Attempt to update invalid fields: ${invalidFields.join(', ')}`);
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
      logger.info('Update User Info: No fields updated');
      return res.status(204).send();
    }
  } catch (error) {
    logger.error('Update User Info: Error updating user information', error);
    return res.status(500).json({ error: "An error occurred while updating user information." });
  }
};


