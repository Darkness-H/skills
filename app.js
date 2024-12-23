var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Routers
const usersRouter = require('./routes/users.routes');
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

// Biblioteca para realizar hasing de contraseñas
const bcrypt = require('bcrypt');
// Biblioteca para proteger rutas y manejar estados entre solicitudes
const session = require('express-session');
// Script para conectarse a la base de datos MongoDB
const connectDB = require('./config/database');
// Módulo que permite almacenar sesiones en MongoDB
const MongoStore = require('connect-mongo');

// Importar eschemas definidos
const User = require('./models/user.model');

var app = express();

// Conexión a MongoDB
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  // Clave secreta para firmar la sesión. Debe ser única y segura.
  secret: 'your-secret-key',
  // `resave: false` asegura que la sesión no se guarde de nuevo si no ha sido modificada.
  resave: false,
  // `saveUninitialized: true` guarda una sesión nueva incluso si no ha sido modificada.
  saveUninitialized: true,
  // La propiedad `store` permite utilizar `MongoStore` para guardar las sesiones en una base de datos MongoDB.
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/projectSW',
    // `ttl` (Time to Live) establece la duración de la sesión en segundos.
    // En este caso, se establece en 24 horas (24 * 60 * 60 segundos).
    ttl: 24 * 60 * 60 // 1 day
  })
}));


//app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/users', usersRouter);

/////////////////////
/// Autenticación ///
/////////////////////

// Ruta por defecto que redirige a '/login'
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Serve login page: GET /users/login
app.get('/login/:message?', (req, res) => {
    const message = req.query.message;
    res.render('login', {
        success_msg: message || null,
        error_msg: null,
        error: null,
    });
});

// Serve register page: GET /users/register
app.get('/register/:message?', (req, res) => {
    const message = req.query.message;
    res.render('register', {
        success_msg: message || null,
        error_msg: null,
        error: null,
    });
});

// Register endpoint: POST /users/register
app.post('/register', async (req, res) => {
    try {
        const { username, password, password2 } = req.body;

        // Se deben llenar todos los campos
        if (!username || !password || !password2) {
            console.log('Missing username or password');
            return res.render('register', {success_msg: null, error_msg: 'Missing username or password', error: null});
            //return res.status(400).send('Username and password are required');
        }

        // Check if the passwords are the same (Las contraseñas deben coincidir)
        if (password !== password2) {
            console.log('Both passwords must be the same!');
            return res.render('register', {success_msg: null, error_msg: 'Both passwords must be the same!', error: null});
            //return res.status(400).send('Both passwords must be the same!');
        }

        // Las contraseñas deben tener al menos 6 caracteres
        if (password.length < 6) {
            console.log('The password must contain at least 6 characters!');
            return res.render('register', {success_msg: null, error_msg: 'The password must contain at least 6 characters!', error: null});
            //return res.status(400).send('The password must contain at least 6 characters!');
        }

        // Check if user exists (El nombre de usuario debe ser único)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.render('register', {success_msg: null, error_msg: 'Username already exists', error: null});
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
            res.redirect('/login?message=User registered successfully');
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
})

// Login endpoint: POST /users/login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.render('login', {success_msg: null, error_msg: 'User not found', error: null});
            //return res.status(400).send('User not found');
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password');
            return res.render('login', {success_msg: null, error_msg: 'Invalid password', error: null});
            //return res.status(400).send('Invalid password');
        }

        // Set session
        req.session.user = username;
        // Redirecionar a la página principal
        res.redirect('/system');
    } catch (error) {
        console.log('Error logging in');
        return res.render('login', {success_msg: null, error_msg: null, error: 'Error logging in'});
        //res.status(500).send('Error logging in');
    }
});

// Endpoint de la página principal (protected)
app.get('/system', (req, res) => {
    if (!req.session.user) {
        // Redireccionar al Login
        return res.redirect('/');
    }
    res.render('index');
});

// Endpoint de logout: GET /users/logout
app.get('/logout', (req, res) => {
    // Auntenticación
    if (!req.session.user) {
        // Redireccionar al Login
        return res.redirect('/');
    }

    // Destruir la sesión y redirigir a la página de Login
    req.session.destroy();
    res.redirect('/login?message=Logged out successfully');
})

// Endpoint para visualizar la clasificación de usuarios
app.get('/leaderboard', (req, res) => {
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
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;