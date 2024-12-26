// Obtener insignias de la base de datos mongoose
const Badge = require('../models/badge.model');
// Obtener usuarios de la base de datos mongoose
const User = require('../models/user.model');

// Controlador para GET /admin/dashboard
exports.getDashboard = async (req, res) => {
    res.render('admin-dashboard', { username: req.user.username });
};

// Controlador para GET /admin/badges
exports.getBadges = async (req, res, next) => {
    try{
        const badges = await Badge.find();
        const sortedBadges = badges.sort((a, b) => a.bitpoints_min - b.bitpoints_min);
        res.render('admin-badges', { badges: sortedBadges });
    } catch (error) {
        next(error);
    }
};

// Controlador para GET /admin/badges/edit/:id
exports.editBadge = async (req, res, next) => {
    try{
        const badge = Badge.find(b => b.id === parseInt(req.params.id));
        if (!badge) {
            return res.status(404).render('error', { message: 'Insignia no encontrada' });
        }
        res.render('edit-badge', { badge });
    }
    catch (error) {
        next(error);
    }
};

// Controlador para POST /admin/badges/edit/:id
exports.updateBadge = async (req, res, next) => {
    try{
        const badge = Badge.find(b => b.id === parseInt(req.params.id));
        if (!badge) {
            return res.status(404).render('error', { message: 'Insignia no encontrada' });
        }
        badge.rango = req.body.rango || badge.rango;
        badge.bitpoints_min = req.body.bitpoints_min || badge.bitpoints_min;
        badge.bitpoints_max = req.body.bitpoints_max || badge.bitpoints_max;
        badge.png = req.body.png || badge.png;
        res.redirect('/admin/badges');
    }
    catch (error) {
        next(error);
    }
};

// Controlador para POST /admin/badges/delete/:id
exports.deleteBadge = async (req, res, next) => {
    try{
        const badge = Badge.find(b => b.id === parseInt(req.params.id));
        if (!badge) {
            return res.status(404).render('error', { message: 'Insignia no encontrada' });
        }
        const index = Badge.indexOf(badge);
        Badge.splice(index, 1);
        res.redirect('/admin/badges');
    }
    catch (error) {
        next(error);
    }
};

// Controlador para GET /admin/users
exports.getUsers = async (req, res, next) => {
    try{
        const users = await User.find();
        res.render('admin-users', { users });
    } catch (error) {
        next(error);
    }
};

// Controlador para POST /admin/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User.find(u => u.id === userId);
        if (!user) {
            return res.status(404).render('error', { message: 'Usuario no encontrado' });
        }
        user.password = newPassword;
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        next(error);
    }
};