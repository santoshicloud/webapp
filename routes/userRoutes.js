// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { publishVerificationMessage } = require('../controllers/userController')

router.post('/', userController.createUser);
router.get('/self', userController.getUserInfo);
router.put('/self', userController.updateUserInfo);
// router.get('/self', userController.verifyUser)

module.exports = router;
