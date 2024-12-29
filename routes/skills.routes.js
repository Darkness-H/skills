const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');
const upload = require('../middlewares/upload');

// GET /skills
router.get('/', skillsController.showDefaultSkillTree);

// GET /skills/:skillTreeName
router.get('/:skillTreeName', skillsController.showSkillTree);

// GET /skills/:skillTreeName/add
router.get('/:skillTreeName/add', skillsController.showAddSkillForm);

// POST /skills/:skillTreeName/add
router.post('/:skillTreeName/add', upload.single('icon'), skillsController.addSkill);

// GET /skills/:skillTreeName/view/:skillID
router.get('/:skillTreeName/view/:skillID', skillsController.viewSkill);

// POST /skills/:skillTreeName/:skillID/verify
//router.post('/:skillTreeName/:skillID/verify', skillsController.verifySkill);

// GET /skills/:skillTreeName/edit/:skillID
router.get('/:skillTreeName/edit/:skillID', skillsController.showEditSkillForm);

// POST /skills/:skillTreeName/edit/:skillID
router.post('/:skillTreeName/edit/:skillID', upload.single('icon'),  skillsController.updateSkill);

// POST /skills/:skillTreeName/submit-evidence
//router.post('/:skillTreeName/submitEvidence', skillsController.submitEvidence);

// POST /skills/:skillTreeName/delete/:skillID
router.post('/:skillTreeName/delete/:skillID', skillsController.deleteSkill);


module.exports = router;