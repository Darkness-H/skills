const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Middleware de autenticación
function authenticateAdmin(req, res, next) {
    if (req.session.user && req.session.user.admin) {
        return next();
    }
    res.status(403).send('Access denied: admin role required.');
}

// Rutas
router.get('/dashboard', authenticateAdmin, adminController.getDashboard);
router.get('/badges', authenticateAdmin, adminController.getBadges);
router.get('/badges/edit/:id', authenticateAdmin, adminController.editBadge);
router.post('/badges/edit/:id', authenticateAdmin, adminController.updateBadge);
router.post('/badges/delete/:id', authenticateAdmin, adminController.deleteBadge);
router.get('/users', authenticateAdmin, adminController.getUsers);
router.post('/change-password', authenticateAdmin, adminController.changePassword);

module.exports = router;