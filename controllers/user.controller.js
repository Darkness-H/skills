const User = require('../models/user.model');

// Función que devuelve todos los usuarios de la base de datos
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        next(error);
    }
};