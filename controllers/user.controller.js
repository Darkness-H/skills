const User = require('../models/user.model');
const bcrypt = require("bcrypt");
const Badge = require('../models/badge.model');
const Skill = require('../models/skill.model');

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

    try {

        // *** Recalcular la puntuación de todos los usuarios ***
        // Obtener todos los usuarios de la base de datos
        const  users = await User.find();
        // Actualizar la puntuación de cada usuario
        for (let user of users) {
            // Calcular la nueva puntuación sumando los scores de completedSkills
            user.score = user.completedSkills.reduce((acumulador, skill) => acumulador + skill.score, 0);
            // Guardar los cambios en la base de datos
            await user.save();
        };

        // Ordenar en relación a la puntuación (de mayor a menor)
        const sortedUsers = users.sort((a, b) => b.score - a.score);

        // Crear un objeto para organizar los usuarios por medalla
        const leaderboard = {
            'Observador': [],
            'Aspirante a Cadete': [],
            'Cadete': [],
            'Aspirante a Padawan': [],
            'Padawan': [],
            'Aspirante a Jedi': [],
            'Jedi': [],
            'Caballero Jedi': []
        };

        // *** Asigna insignias en función de puntuación ***
        // Obtener todos los badges de la base de datos
        const badges = await Badge.find();
        // Encontrar el badge con el mayor bitpoint_max
        const badgeWithMaxBitpoints = badges.reduce((max, current) => {
            return (current.bitpoints_max > max.bitpoints_max) ? current : max;
        }, badges[0]);
        // Función para obtener el rango y la medalla basada en el score del usuario
        function getBadgeForUser(score) {
            for (let badge of badges) {
                if (score >= badge.bitpoints_min && score <= badge.bitpoints_max) {
                    return badge;
                }
            }
            // El score del usuario excede el límite de 229 -> asignar insignia Caballero Jedi (o alguna otra insignia que ha sido añadido más tarde)
            return badgeWithMaxBitpoints;
        }
        // Asignar insignias en función de la puntuación de cada usuario
        const usersArray = Array.from(sortedUsers); // Convierte a array si no es ya un array
        usersArray.forEach((user) => {
            // Obtener el badge para el score del usuario actual
            const badge = getBadgeForUser(user.score);
            // Buscar la primera clave del leaderboard que coincida parcialmente con el rango del badge (e.g 'Cadete' vs 'Cadete nivel-1')
            const leaderboardKey = Object.keys(leaderboard).find(key => badge.rango.startsWith(key));


            // Agregar el usuario a la lista correspondiente dentro del leaderboard
            leaderboard[leaderboardKey].push({
                username: user.username,
                score: user.score, // Guardar un número entre 0 y 9
                badge: badge.png, // Usar la URL de la imagen del badge
                range: badge.rango
            }); // Siempre va a existir uno
        });

        // Realiza la agregación y espera el resultado
        const skillTreesWithCount = await Skill.aggregate([
            { $group: { _id: "$set", skillCount: { $sum: 1 } } }
        ]);
        // Transformar los datos para facilitar su uso en la plantilla
        const skillTrees = skillTreesWithCount.map(tree => ({
            name: tree._id,
            count: tree.skillCount
        }));

        // Renderizar la vista 'leaderboard.ejs' pasando los datos
        res.render('leaderboard', { leaderboard: leaderboard, user: req.session.user, skillTrees: skillTrees, badges: badges });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Error fetching leaderboard');
    }
};

// Función que muestra la página de about
exports.showAboutPage = async (req, res, next) => {
    res.render('about', { user: req.session.user });
};