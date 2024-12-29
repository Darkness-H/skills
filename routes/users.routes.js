const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /users/register
router.get('/register/:message?', userController.showRegisterPage);

// POST /users/register
router.post('/register', userController.addNewUser);

// GET /users/login
router.get('/login/:message?', userController.showLoginPage);

// POST /users/login
router.post('/login', userController.loginSystem);

// GET /users/logout
router.get('/logout', userController.logoutSystem);

// GET /users/leaderboard
router.get('/leaderboard', userController.visualizeLeaderboard);

// GET /users/about
router.get('/about', userController.showAboutPage);

module.exports = router;