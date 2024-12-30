const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Middleware de autenticación
function authenticateUser(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

// GET /users/register
router.get('/register/:message?', userController.showRegisterPage);

// POST /users/register
router.post('/register', userController.addNewUser);

// GET /users/login
router.get('/login/:message?', userController.showLoginPage);

// POST /users/login
router.post('/login', userController.loginSystem);

// GET /users/logout
router.get('/logout',  authenticateUser, userController.logoutSystem);

// GET /users/leaderboard
router.get('/leaderboard',  authenticateUser, userController.visualizeLeaderboard);

// GET /users/about
router.get('/about', userController.showAboutPage);

module.exports = router;