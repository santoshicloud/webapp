# webapp

In this assignment we are creating a backend application which performs CRUD operations of a user using the help of different api's.

The folder structure is as follows: The main script where the server is starting is in index.js. The routes of the api's are in routes folder The database schema is present in models/userModel. The api logic is present in controllers/user.js The db details are present in db.js and .env file contains the environment details. Tests are written in tests/test.js

The controller contains 3 main methods: createUser which is a POST method and takes in firstname, lastname, username and password. getUser which is a GET method and takes userid as a parameter and fetches the data of the user editUser which is a PUT method and also takes the userid parameter to update the data.

the GET and PUT method are authenticated that means they require authentication to work.

In this assignment we are using sequelize orm instead of using queries to create tables, insert data and fetch values.

We test the api's using Postman.

we have also created a .github/workflows folder/file which contains the yml file. The yml file contains the workflow structure which allows github to know whenever we push the code to our branch.

Whenever a pull request us created from our feature branch in our fork to the main branch in our org, workflow is triggered and checks if all the test cases are passing.

Only if all test cases are passing, then we should be able to merge our changes.
