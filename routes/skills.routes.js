const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');
const upload = require('../middlewares/upload');

// Middleware de autenticación
function authenticateAdmin(req, res, next) {
    if (req.session.user && req.session.user.admin) {
        return next();
    }
    res.status(403).send('Access denied: admin role required.');
}

function authenticateUser(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/users/login');
}

// GET /skills
router.get('/', authenticateUser, skillsController.showDefaultSkillTree);

// GET /skills/:skillTreeName
router.get('/:skillTreeName', authenticateUser, skillsController.showSkillTree);

// GET /skills/:skillTreeName/add
router.get('/:skillTreeName/add', authenticateAdmin, skillsController.showAddSkillForm);

// POST /skills/:skillTreeName/add
router.post('/:skillTreeName/add', authenticateAdmin, upload.single('icon'), skillsController.addSkill);

// GET /skills/:skillTreeName/view/:skillID
router.get('/:skillTreeName/view/:skillID', authenticateUser, skillsController.viewSkill);

// POST /skills/:skillTreeName/:skillID/verify
router.post('/:skillTreeName/:skillID/verify',authenticateUser, skillsController.verifySkill);

// GET /skills/:skillTreeName/edit/:skillID
router.get('/:skillTreeName/edit/:skillID', authenticateAdmin, skillsController.showEditSkillForm);

// POST /skills/:skillTreeName/edit/:skillID
router.post('/:skillTreeName/edit/:skillID', authenticateAdmin, upload.single('icon'),  skillsController.updateSkill);

// POST /skills/:skillTreeName/submit-evidence
router.post('/:skillTreeName/submitEvidence', authenticateUser, skillsController.submitEvidence);

// POST /skills/:skillTreeName/delete/:skillID
router.post('/:skillTreeName/delete/:skillID', authenticateAdmin, skillsController.deleteSkill);


module.exports = router;