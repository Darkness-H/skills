const User = require('../models/user.model');
const path = require('path');
const bcrypt = require("bcrypt");

// Función que muestra la pantalla para registrar una nueva cuenta (Register)
exports.showRegisterPage = async (req, res, next) => {
    const message = req.query.message;
    res.render('register', {
        success_msg: message || null,
        error_msg: null,
        error: null,
        user: null
    });
};

// Función que crea un nuevo usuario en la base de datos
exports.addNewUser = async (req, res, next) => {
    try {
        const { username, password, password2 } = req.body;

        // Se deben llenar todos los campos
        if (!username || !password || !password2) {
            console.log('Missing username or password');
            return res.render('register', {success_msg: null, error_msg: 'Missing username or password', error: null, user: null});
            //return res.status(400).send('Username and password are required');
        }

        // Check if the passwords are the same (Las contraseñas deben coincidir)
        if (password !== password2) {
            console.log('Both passwords must be the same!');
            return res.render('register', {success_msg: null, error_msg: 'Both passwords must be the same!', error: null, user: null});
            //return res.status(400).send('Both passwords must be the same!');
        }

        // Las contraseñas deben tener al menos 6 caracteres
        if (password.length < 6) {
            console.log('The password must contain at least 6 characters!');
            return res.render('register', {success_msg: null, error_msg: 'The password must contain at least 6 characters!', error: null, user: null});
            //return res.status(400).send('The password must contain at least 6 characters!');
        }

        // Check if user exists (El nombre de usuario debe ser único)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.render('register', {success_msg: null, error_msg: 'Username already exists', error: null, user: null});
            //return res.status(400).send('Username already exists');
        }

        // Create new user
        const user = new User({ username, password });

        // Establecemos su rol como admin si es el primer usuario
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            user.admin = true;
        }

        try {
            await user.save();
            console.log('User registered successfully:', username);
            res.redirect('/users/login?message=User registered successfully');
        } catch (saveError) {
            console.error('Error saving user:', saveError);
            return res.render('register', {success_msg: null, error_msg: null, error: 'Error saving user'});
            //res.status(500).send('Error saving user');
        }
    } catch (error) {
        console.error('Registration error:', error);
        return res.render('register', {success_msg: null, error_msg: null, error: 'Error registering user'});
        //res.status(500).send('Error registering user');
    }
};

// Función que muestra la pantalla para iniciar sesión (Login)
exports.showLoginPage = async (req, res, next) => {
    const message = req.query.message;
    res.render('login', {
        success_msg: message || null,
        error_msg: null,
        error: null,
        user: null
    });
};

// Función que inicia una sesión con los datos introducidos
exports.loginSystem = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.render('login', {success_msg: null, error_msg: 'User not found', error: null, user: null});
            //return res.status(400).send('User not found');
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password');
            return res.render('login', {success_msg: null, error_msg: 'Invalid password', error: null, user: null});
            //return res.status(400).send('Invalid password');
        }

        // Set session
        //req.session.user = username;
        req.session.user = user;
        // Redirecionar a la página principal
        res.redirect('/system'); // /system -> /skills/electronics
    } catch (error) {
        console.log('Error logging in');
        return res.render('login', {success_msg: null, error_msg: null, error: 'Error logging in'});
        //res.status(500).send('Error logging in');
    }
};

// Función que cierra la sesión actual
exports.logoutSystem = async (req, res, next) => {
    // Auntenticación
    if (!req.session.user) {
        // Redireccionar al Login
        return res.redirect('/');
    }

    // Destruir la sesión y redirigir a la página de Login
    req.session.destroy();
    res.redirect('/users/login?message=Logged out successfully');
};

// Función para visualizar la clasificación de usuarios
exports.visualizeLeaderboard = async (req, res, next) => {
    // Auntenticación
    if (!req.session.user) {
        // Redireccionar al Login
        return res.redirect('/');
    }

    // Recalcular la puntuación de todos los usuarios
    // Ordena en relación a la puntuación
    // Asigna insignias en función de puntuación
    // Resultado: redirecciona a la vista leaderboard.ejs con la clasificación
    // res.render('leaderboard');
    res.render('/')
};

// Función que muestra la página de about
exports.showAboutPage = async (req, res, next) => {
        res.render('about', { user: req.session.user });
};