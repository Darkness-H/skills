const mongoose = require('mongoose');
const User = require('./models/user.model'); // Asegúrate de que la ruta sea correcta
const bcrypt = require('bcrypt');

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/projectSW', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Usuarios de ejemplo
const users = [
    { username: 'A', password: '123456', score: 1},
    { username: 'A', password: '123456', score: 20},
    { username: 'B', password: '123456', score: 25 },
    { username: 'C', password: '123456', score: 112 },
    { username: 'D', password: '123456', score: 203 },
    { username: 'E', password: '123456', score: 227 }
];

// Insertar usuarios
async function seedUsers() {
    try {
        // Eliminar todos los usuarios existentes
        await User.deleteMany({});  // Esto elimina todos los documentos de la colección 'users'
        console.log('Usuarios eliminados.');

        // Encriptar contraseñas antes de guardar
        for (let user of users) {
            user.password = await bcrypt.hash(user.password, 10);
        }

        // Lógica para gestionar duplicados por username y seleccionar el mayor score
        const processedUsers = {};  // Para almacenar el usuario con el mayor score por username

        for (let user of users) {
            // Comprobar si ya se ha procesado un usuario con este username
            if (!processedUsers[user.username]) {
                processedUsers[user.username] = user;
            } else {
                // Si ya existe, comprobar si el score actual es mayor que el existente
                if (user.score > processedUsers[user.username].score) {
                    processedUsers[user.username] = user;
                }
            }
        }

        // Insertar o actualizar los usuarios con el mayor score
        for (let username in processedUsers) {
            const user = processedUsers[username];
            // Buscar si ya existe un usuario con el mismo username
            const existingUser = await User.findOne({ username: user.username });

            if (existingUser) {
                // Si existe, solo actualizamos si el nuevo score es mayor
                if (user.score > existingUser.score) {
                    await User.updateOne(
                        { username: user.username },
                        { $set: { score: user.score, password: user.password } }
                    );
                    console.log(`Usuario ${user.username} actualizado con el nuevo score: ${user.score}`);
                }
            } else {
                // Si no existe, lo insertamos como nuevo
                await User.create(user);
                console.log(`Usuario ${user.username} insertado.`);
            }
        }
    } catch (err) {
        console.error('Error insertando usuarios:', err);
    } finally {
        mongoose.disconnect();
    }
}

seedUsers();
