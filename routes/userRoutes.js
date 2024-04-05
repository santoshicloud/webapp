// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/self', userController.getUserInfo);
router.put('/self', userController.updateUserInfo);
router.get('/verify/token', userController.verifyUser);

module.exports = router;

