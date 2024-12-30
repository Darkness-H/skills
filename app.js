var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Routers
const usersRouter = require('./routes/users.routes');
const skillsRouter = require('./routes/skills.routes');
const adminRouter = require('./routes/admin.routes');
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

const passport = require('passport');
require('./config/passport-config'); // Configuración de Passport

// Importar eschemas definidos
const User = require('./models/user.model');
const Skill = require('./models/skill.model');

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
  secret: 'ndAZH1gDNaJURXRrQi5f1nfxb43NUecPT',
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

// Inicializa Passport en la aplicación.
app.use(passport.initialize());
// Habilita el manejo de la sesión (Github) con Passport.
app.use(passport.session());

app.use('/users', usersRouter);
app.use('/skills', skillsRouter);
app.use('/admin', adminRouter);

// Ruta por defecto que redirige a '/users/login'
app.get('/', (req, res) => {
  res.redirect('/users/login');
});

// Endpoint de la página principal (protected)
app.get('/system', (req, res) => {
    res.redirect('/skills');
});

// Endpoint de la página de about
app.get('/about', async (req, res) => {
    try {
        // Realiza la agregación y espera el resultado
        const skillTreesWithCount = await Skill.aggregate([
            { $group: { _id: "$set", skillCount: { $sum: 1 } } }
        ]);

        // Transformar los datos para facilitar su uso en la plantilla
        const skillTrees = skillTreesWithCount.map(tree => ({
            name: tree._id,
            count: tree.skillCount
        }));

        // Renderiza la página con los datos necesarios
        res.render('about', { user: req.session.user, skillTrees: skillTrees });
    } catch (err) {
        console.error("Error en el endpoint /about:", err);
        res.status(500).send("Error interno del servidor");
    }
});

//////////////////////////
// Authenticación OAuth //
//////////////////////////

// Ruta para iniciar la autenticación con GitHub
app.get('/auth/github', passport.authenticate('github'));
// Callback de GitHub
app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Si la autenticación es exitosa, establece la sesión y  redirige al sistema principal
        req.session.user = res.req.user;
        res.redirect('/skills');
    }
);

//////////////////////////
//////////////////////////

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