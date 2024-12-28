const mongoose = require('mongoose');
const User = require('./models/user.model'); // Asegúrate de que la ruta sea correcta

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/projectSW', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Usuarios de ejemplo
const users = [
    { username: 'observador', password: '123456', score: 1},
    { username: 'cadete', password: '123456', score: 25 },
    { username: 'padawan_N1', password: '123456', score: 112 },
    { username: 'jedi_N2', password: '123456', score: 203 },
    { username: 'caballeroJedi', password: '123456', score: 227 }
];

// Insertar usuarios
async function seedUsers() {
    try {
        // Eliminar todos los usuarios existentes
        await User.deleteMany({});  // Esto elimina todos los documentos de la colección 'users'
        console.log('Usuarios eliminados.');

        // Encriptar contraseñas antes de guardar
        const bcrypt = require('bcrypt');
        for (let user of users) {
            user.password = await bcrypt.hash(user.password, 10);
        }

        // Insertar usuarios nuevos
        await User.insertMany(users);
        console.log('Usuarios insertados correctamente');
    } catch (err) {
        console.error('Error insertando usuarios:', err);
    } finally {
        mongoose.disconnect();
    }
}

seedUsers();
