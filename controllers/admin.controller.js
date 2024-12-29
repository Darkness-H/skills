// Obtener insignias de la base de datos mongoose
const Badge = require('../models/badge.model');
// Obtener usuarios de la base de datos mongoose
const User = require('../models/user.model');
const Skill = require("../models/skill.model");
const bcrypt = require("bcrypt");

// Controlador para GET /admin/dashboard
exports.getDashboard = async (req, res, next) => {
    try {
        // Obtener todos los árboles de habilidades con sus conteos
        const skillTreesWithCount = await Skill.aggregate([
            {$group: {_id: "$set", skillCount: {$sum: 1}}}
        ]);

        // Transformar los datos para facilitar su uso en la plantilla
        const skillTrees = skillTreesWithCount.map(tree => ({
            name: tree._id,
            count: tree.skillCount
        }));

        res.render('admin-dashboard', {user: req.session.user, skillTrees: skillTrees});
    }catch(error){
        next(error)
    }
};

// Controlador para GET /admin/badges
exports.getBadges = async (req, res, next) => {
    try{
        const badges = await Badge.find();
        const sortedBadges = badges.sort((a, b) => a.bitpoints_min - b.bitpoints_min);

        // Obtener todos los árboles de habilidades con sus conteos
        const skillTreesWithCount = await Skill.aggregate([
            {$group: {_id: "$set", skillCount: {$sum: 1}}}
        ]);

        // Transformar los datos para facilitar su uso en la plantilla
        const skillTrees = skillTreesWithCount.map(tree => ({
            name: tree._id,
            count: tree.skillCount
        }));

        res.render('admin-badges', { badges: sortedBadges, user: req.session.user, skillTrees: skillTrees});
    } catch (error) {
        next(error);
    }
};

// Controlador para GET /admin/badges/edit/:id
exports.editBadge = async (req, res, next) => {
    try{
        const badgeID = req.params.id;
        const badge = await Badge.findOne({ _id: badgeID });
        if (!badge) {
            return res.status(404).render('error', { message: 'Badge not found' });
        }

        // Obtener todos los árboles de habilidades con sus conteos
        const skillTreesWithCount = await Skill.aggregate([
            {$group: {_id: "$set", skillCount: {$sum: 1}}}
        ]);

        // Transformar los datos para facilitar su uso en la plantilla
        const skillTrees = skillTreesWithCount.map(tree => ({
            name: tree._id,
            count: tree.skillCount
        }));

        res.render('edit-badge', {badge: badge, user: req.session.user, skillTrees: skillTrees});
    }
    catch (error) {
        next(error);
    }
};

// Controlador para POST /admin/badges/edit/:id
exports.updateBadge = async (req, res) => {
    try{
        const badgeID = req.params.id;
        const updateData = req.body;

        const badge = await Badge.findOneAndUpdate({ _id: badgeID }, updateData, {
            new: true, runValidators: true
        });
        if (!badge) {
            return res.status(404).render('error', { message: 'Badge not found' });
        }
        res.redirect('/admin/badges');
    }
    catch (error) {
        return res.status(500).render('error', { message: 'Error updating badge' });
    }
};

// Controlador para POST /admin/badges/delete/:id
exports.deleteBadge = async (req, res, next) => {
    try{
        const badgeID = req.params.id;
        const badge = await Badge.findOneAndDelete({ _id: badgeID });
        if (!badge) {
            return res.status(404).render('error', { message: 'Badge not found' });
        }
        res.redirect('/admin/badges');
    }
    catch (error) {
        return res.status(500).render('error', { message: 'Error deleting badge' });
    }
};

// Controlador para GET /admin/users
exports.getUsers = async (req, res, next) => {
    try{
        const users = await User.find();
        res.render('admin-users', {users: users});
    } catch (error) {
        next(error);
    }
};

// Controlador para POST /admin/change-password
exports.changePassword = async (req, res) => {
    try {
        const {username, password } = req.body;
        const encrypted_password = await bcrypt.hash(password, 10);
        const user = await User.findOneAndUpdate({username: username }, {password: encrypted_password }, {
            new: true, runValidators: true
        });

        if (!user) {
            return res.status(404).render('error', { error: 'User not found', message: 'User not found' });
        }

        // Responder con éxito
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        // Manejo de errores
        return res.status(500).render('error', { error: error, message: 'Error updating password' });
    }
};
