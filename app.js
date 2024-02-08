const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); 
// Database connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "test",
  password: "root",
  port: 5432,
});
// Middleware 
const checkPayloadAndCacheControl = (req, res, next) => {
  if (req.method !== 'GET' && Object.keys(req.body).length !== 0) {
    return res.status(400).end();
  }
 
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
};
const checkDatabaseConnection = async (req, res, next) => {
  try {
    const client = await pool.connect();
    client.release(); 
    next(); 
  } catch (error) {
    return res.status(503).end();
  }
};
// Health check 
app.route('/healthz')
  .all(checkPayloadAndCacheControl)
  .get(checkDatabaseConnection, (req, res) => {
    console.log('Request Body:', req.body); 
    res.status(200).end();
  })
  .head((req, res) => {
    return res.status(405).end();
  });
// New POST 
app.post('/v1/user', checkDatabaseConnection, async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUserQuery = "SELECT email FROM users WHERE email = $1";
    const existingUserResult = await pool.query(existingUserQuery, [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ error: "User with this email address already exists." });
    }
    const insertQuery = `
      INSERT INTO users (email, password, first_name, last_name, account_created)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING email, first_name, last_name, account_created
    `;
    const result = await pool.query(insertQuery, [email, hashedPassword, firstName, lastName]);
    const user = result.rows[0];
    res.status(201).json({ 
      message: "User created successfully.",
      user: {
        username: user.email, 
        firstName: user.first_name,
        lastName: user.last_name,
        account_created: user.account_created
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An error occurred while creating the user." });
  }
});


// New GET 
app.get('/v1/user/self', checkDatabaseConnection, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(400).json({ error: "Basic Authentication credentials not provided" });
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  const userEmail = username;
  try {
    const query = "SELECT id, first_name, last_name, email AS username, account_created, account_updated FROM users WHERE email = $1";
    const result = await pool.query(query, [userEmail]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = result.rows[0];
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    res.status(500).json({ error: "An error occurred while retrieving user information." });
  }
});

//PUT METHOD
app.put('/v1/user/self', checkDatabaseConnection, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ error: "Basic Authentication credentials not provided" });
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const userEmail = credentials.split(':')[0]; 
    const { firstName, lastName, password } = req.body;
    if (req.body.email) {
      return res.status(400).json({ error: "Cannot update email address" });
    }
    if (!firstName && !lastName && !password) {
      return res.status(400).json({ error: "No fields provided for update" });
    }
    const updateQuery = `
      UPDATE users 
      SET 
        ${firstName ? "first_name = $1," : ""}
        ${lastName ? "last_name = $2," : ""}
        ${password ? "password = $3," : ""}
        account_updated = NOW()
      WHERE email = $4
      RETURNING id, email AS username, first_name, last_name, account_created, account_updated
    `;
    const queryParams = [firstName, lastName, password, userEmail].filter(param => param !== undefined);
    console.log('SQL query:', updateQuery);
    console.log('Query params:', queryParams);
    const updatedUserResult = await pool.query(updateQuery, queryParams);
    const updatedUser = updatedUserResult.rows[0];
    res.status(201).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ error: "An error occurred while updating user information." });
  }
});

// Middleware to handle unsupported HTTP methods
const handleUnsupportedMethods = (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }
  next();
};
app.use(handleUnsupportedMethods); 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
