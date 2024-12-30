const Skill = require('../models/skill.model');
const path = require('path');

// Función auxiliar para obtener árboles de habilidades con conteo
const getSkillTreesWithCount = async () => {
    const skillTreesWithCount = await Skill.aggregate([
        { $group: { _id: "$set", skillCount: { $sum: 1 } } }
    ]);
    return skillTreesWithCount.map(tree => ({
        name: tree._id,
        count: tree.skillCount
    }));
}


// Función que redirecciona a la página de la competencia defecto
exports.showDefaultSkillTree = async (req, res, next) => {
    res.redirect('/skills/electronics');
}

// Función que muestra la pantalla de la competencia seleccionada
exports.showSkillTree = async (req, res, next) => {
    if (!req.session.user) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }

    try {
        const skillTreeName = req.params.skillTreeName;
        const skills = await Skill.find({
            set: skillTreeName
        });

        const skillTrees = await getSkillTreesWithCount();
        res.render('index', {skills: skills, skillTreeName: skillTreeName, user: req.session.user, skillTrees: skillTrees});
    } catch (error) {
        next(error);
    }
}




// Función que muestra la pantalla de edición de la skill seleccionada
exports.showEditSkillForm = async (req, res, next) => {
    if (!req.session.user || !req.session.user.admin) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }
    try {
        const skillTreeName = req.params.skillTreeName;
        const skillID = req.params.skillID;
        const skill = await Skill.findOne({ set: skillTreeName, taskID: skillID });
        if (!skill) {
            return res.status(404).send('404 Error: Skill not found');
        }

        const skillTrees = await getSkillTreesWithCount();
        res.render('editSkill', {skill: skill, success_msg: null, error_msg: null, error: null, user: req.session.user, skillTrees: skillTrees});
    } catch (error) {
        next(error);
    }
}

// Función que actualiza la skill seleccionada
exports.updateSkill = async (req, res, next) => {
    if (!req.session.user || !req.session.user.admin) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }
    try {
        const skillTreeName = req.params.skillTreeName;
        const skillID = req.params.skillID;
        const updateData = req.body;

        // Convert text, description, and tasks to arrays of strings
        updateData.text = req.body.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        updateData.tasks = req.body.tasks.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        updateData.resources = req.body.resources.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (req.file) {
            updateData.icon = path.join('/', skillTreeName, 'icons', req.file.filename);
        }

        const skill = await Skill.findOneAndUpdate({ set: skillTreeName, taskID: skillID }, updateData, {
            new: true, runValidators: true
        });

        const skillTrees = await getSkillTreesWithCount();
        res.render('editSkill', {skill: skill, success_msg: 'Saved Successfully', error_msg: null, error: null, user: req.session.user, skillTrees: skillTrees});
    } catch (error) {
        //res.render('editSkill', {skill: skill, success_msg: null, error_msg: 'Save failed', error: error});
        res.render('partials/messages', {success_msg: null, error_msg: 'Save failed', error: error});
    }
}

//Función para eliminar una skill
exports.deleteSkill = async (req, res, next) => {
    if (!req.session.user || !req.session.user.admin) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }
    try {
        const skillTreeName = req.params.skillTreeName;
        const skillID = req.params.skillID;
        const skill = await Skill.findOneAndDelete({set: skillTreeName, taskID: skillID});
        if (!skill) {
            return res.status(404).send('404 Error: Skill not found');
        }
        res.redirect(`/skills/${skillTreeName}`);
    } catch (error) {
        res.render('partials/messages', {success_msg: null, error_msg: 'Delete failed', error: error});
    }
}

// Función que muestra la pantalla de añadir una skill
exports.showAddSkillForm = async (req, res, next) => {
    if (!req.session.user || !req.session.user.admin) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }
    try {
        const skillTreeName = req.params.skillTreeName;

        const skillTrees = await getSkillTreesWithCount();
        res.render('addSkill', {skillTreeName: skillTreeName, success_msg: null, error_msg: null, error: null, user: req.session.user, skillTrees: skillTrees});
    } catch (error) {
        next(error);
    }
}


// Función que añade una skill
exports.addSkill = async (req, res) => {
    if (!req.session.user || !req.session.user.admin) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }
    try {
        const skillTreeName = req.params.skillTreeName;
        const newSkill = new Skill(req.body);

        // Convert text, description, and tasks to arrays of strings
        newSkill.text = req.body.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        newSkill.tasks = req.body.tasks.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        newSkill.resources = req.body.resources.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        //Add set and taskID
        newSkill.set = skillTreeName;
        const skills = await Skill.find
        ({
            set: skillTreeName
        });
        newSkill.taskID = skills.length > 0 ? Math.max(...skills.map(skill => skill.taskID)) + 1 : 1;

        if (req.file) {
            newSkill.icon = path.join('/', skillTreeName, 'icons', req.file.filename);
        }
        await newSkill.save();
        res.redirect(`/skills/${skillTreeName}`);
    } catch (error) {
        console.log(error)
        res.render('partials/messages', {success_msg: null, error_msg: 'Save failed', error: error});
    }
}

// Función que muestra la pantalla de la skill seleccionada
exports.viewSkill = async (req, res, next) => {
    if (!req.session.user) {
        //return res.redirect('/user/login');
        return res.redirect('/login');
    }
    try {
        const skillTreeName = req.params.skillTreeName;
        const skillID = req.params.skillID;
        const skill = await Skill.findOne({ set: skillTreeName, taskID: skillID });
        const user = req.session.user;
        // Mirar si existe userskill, si no existe crear



        if (!skill) {
            return res.status(404).send('404 Error: Skill not found');
        }
        res.render('skillNotebook', {skill: skill});
    } catch (error) {
        next(error);
    }
}
