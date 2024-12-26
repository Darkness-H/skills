// Middleware para gestionar la autenticación de usuarios
const passport = require('passport');
// Proporciona la estrategia para permitir a los usuarios autenticarse a través de GitHub
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user.model');

passport.use(
    new GitHubStrategy(
        {
            clientID: "Ov23liBWspR63E1ARkfT", //process.env.GITHUB_CLIENT_ID,
            clientSecret: "58e412953e24e111567fb58b7c92b435216a15ed", //process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/auth/github/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Verifica si el usuario ya existe en la base de datos
                let user = await User.findOne({ username: profile.username });

                if (!user) {
                    // Si no existe, crea un nuevo usuario.
                    // Para simplificar y no hacer las mismas verificaciones que hacemos en app.js,
                    // aquí, el username será el nombre de usuario de Github y el password será "sw2024" por defecto.
                    user = new User({
                        username: profile.username,
                        password: "sw2024"
                    });
                    // También es posible entrar en el sistema introduciendo estos datos, sin la necesidad de una cuenta Github

                    // Establecemos su rol como admin si es el primer usuario
                    const userCount = await User.countDocuments();
                    if (userCount === 0) {
                        user.admin = true;
                    }

                    await user.save();
                }
                // Hay un caso que no se ha tratado en este sistema y es cuando ya existe una cuenta en la base de datos
                // con el mismo username que el de la cuenta de GitHub. En este escenario, aunque no sepamos la contraseña de
                // la cuenta en el sistema, el usuario podría acceder sin problemas utilizando la autenticación de GitHub,
                // ya que la sesión se establece basándose en el username de GitHub. Sin embargo, en un sistema real, sería
                // recomendable agregar un atributo adicional al esquema de usuario, como `githubId`, para asociar de manera
                // única a cada usuario con su cuenta de GitHub. Esto permitiría identificar correctamente al usuario mediante
                // este identificador único. Además, en caso también sería adecuado pedirle explícitamente al usuario que cree
                // una cuenta nueva, respetando las restricciones y validaciones definidas en el endpoint `/register`.


                // Si el usuario ya existe o se crea uno nuevo, continúa
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serializar y deserializar usuarios github
// La función `serializeUser` es llamada cuando un usuario se autentica
// correctamente y se utiliza para almacenar los datos relevantes del usuario.
passport.serializeUser((user, done) => {
    done(null, user);
});
// La función `deserializeUser` es llamada en cada solicitud posterior para
// recuperar los detalles completos del usuario a partir de la referencia almacenada en la sesión.
passport.deserializeUser((user, done) => {
    done(null, user);
});
