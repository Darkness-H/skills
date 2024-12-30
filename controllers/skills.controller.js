const Skill = require('../models/skill.model');
const UserSkill = require('../models/userskill.model');
const User = require('../models/user.model');
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
exports.showDefaultSkillTree = async (req, res) => {
    res.redirect('/skills/electronics');
}

// Función que muestra la pantalla de la competencia seleccionada
exports.showSkillTree = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName;
        const skills = await Skill.find({
            set: skillTreeName
        });

        const skillTrees = await getSkillTreesWithCount();

        // Obtener todos los userSkills relacionados con el usuario actual
        var allUserSkills = await UserSkill.find();
        var allSkills = await Skill.find();
        var userSkills = await UserSkill.find({user: req.session.user._id});
        const numUsers = await User.countDocuments();

        res.render('index', {skills: skills, skillTreeName: skillTreeName, user: req.session.user,
            skillTrees: skillTrees, userSkills: userSkills, allUserSkills: allUserSkills,
            allSkills: allSkills, numUsers: numUsers});
    } catch (error) {
        res.status(500).send('Error getting skill tree');
    }
}


// Función que muestra la pantalla de edición de la skill seleccionada
exports.showEditSkillForm = async (req, res) => {
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
        res.status(500).send('Error getting edit skill form');
    }
}

// Función que actualiza la skill seleccionada
exports.updateSkill = async (req, res) => {
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
        res.status(500).send('Error updating skill');
    }
}

//Función para eliminar una skill
exports.deleteSkill = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName;
        const skillID = req.params.skillID;
        const skill = await Skill.findOneAndDelete({set: skillTreeName, taskID: skillID});
        if (!skill) {
            return res.status(404).send('404 Error: Skill not found');
        }
        res.redirect(`/skills/${skillTreeName}`);
    } catch (error) {
        res.status(500).send('Error deleting skill');
    }
}

// Función que muestra la pantalla de añadir una skill
exports.showAddSkillForm = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName;

        const skillTrees = await getSkillTreesWithCount();
        res.render('addSkill', {skillTreeName: skillTreeName, success_msg: null, error_msg: null, error: null, user: req.session.user, skillTrees: skillTrees});
    } catch (error) {
        res.status(500).send('Error getting add skill form');
    }
}


// Función que añade una skill
exports.addSkill = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName;
        const newSkill = new Skill(req.body);

        newSkill.text = req.body.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        newSkill.tasks = req.body.tasks.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        newSkill.resources = req.body.resources.split('\n').map(line => line.trim()).filter(line => line.length > 0);

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
        res.status(500).send('Error adding skill');
    }
}

// Función que muestra la pantalla de la skill seleccionada
exports.viewSkill = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName;
        const skillID = req.params.skillID;
        const skill = await Skill.findOne({ set: skillTreeName, taskID: skillID });
        const user = req.session.user;
        if (!skill) {
            return res.status(404).send('Skill not found');
        }
        const userSkills = await UserSkill.find({skill: skill._id, verified: false })

        if (!userSkills) {
            return res.status(404).send('UserSkills not found');
        }

        //Obtener users que se encuentran en userSkills
        for (let i = 0; i < userSkills.length; i++) {
            const userSkill = userSkills[i];
            const user = await User.findById(userSkill.user);
            if (!user) {
                return res.status(404).send('User from userSkills not found');
            }
            userSkills[i].username = user.username;
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


        res.render('skillNotebook', {skill: skill, user: user, userSkills: userSkills, skillTrees: skillTrees});
    } catch (error) {
        res.status(500).send('Error getting skill');
    }
}

// Función que maneja el envío de evidencia
exports.submitEvidence = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName;
        const evidence = req.body.evidence;
        const userSkillId = req.body.userSkillId;
        const userId = req.session.user._id;
        const skillId = req.body.skillId;



        if (!evidence) {
            return res.status(400).json({ message: 'Evidence text needed.' });
        }

        // Mirar si existe userskill, si no existe crear
        let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
        if (!userSkill) {
            userSkill = new UserSkill({
                user: userId,
                skill: skillId,
                completed: false,
                verified: false
            });
        }

        // Actualizar userSkill
        userSkill.evidence = evidence;
        // userSkill.completed = true;
        // userSkill.completedAt = Date.now();

        // Guardar el UserSkill (nuevo o actualizado)
        await userSkill.save();

        // // Actualizar el atributo completedSkills del usuario
        // const user = await User.findById(userId);
        //
        // if (!user) {
        //     return res.status(404).json({ message: 'User not found' });
        // }
        //
        // if (!user.completedSkills.includes(skillId)) {
        //     user.completedSkills.push(skillId);
        //     await user.save();
        // }

        // Responder con un mensaje de éxito
        res.status(200).json({
            message: 'Evidence send correctly',
            userSkill: userSkill
        });
    } catch (error) {
        console.error('Error sending evidence:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Función que confirma la evidencia de una competencia
exports.verifySkill = async (req, res) => {
    try {
        const skillTreeName = req.params.skillTreeName; // electronics
        const skillId = req.params.skillID; // id del skill a comprobar
        const userSkillId = req.body.userSkillId; // id del userSkill
        const userId = req.session.user._id; // id del usuario actual
        const approved = req.body.approved; // false/true -> approve/reject del usuario actual

        // Buscar la evidencia en la base de datos
        let userSkill =  await UserSkill.findById(userSkillId);

        // Añadir el usuario actual en la lista verifications del userSkill
        userSkill.verifications.push({
            user: userId,
            approved: approved,
            verifiedAt: Date.now()
        })

        // Verificando la evidencia
        var approvedNumber = 0;
        for (const user of userSkill.verifications) {
            try {
                // Buscar el usuario en la base de datos
                let user_i = await User.findById(user.user);
                if (user.approved) {
                    // Si el skill ya ha sido superada y solo queremos actualizar el número de approved
                    if (user_i.admin && !userSkill.completed) {
                        userSkill.completed = true;
                        userSkill.verified = true;
                        userSkill.completedAt = Date.now();
                    }
                    approvedNumber += 1;
                }
            } catch (error) {
                console.error('Error verifying evidence:', error);
                res.status(500).json({ message: 'Internal server error', error });
            }
        }
        if (approvedNumber >= 3 && !userSkill.completed) {
            userSkill.completed = true;
            userSkill.verified = true;
            userSkill.completedAt = Date.now();
        }

        // Guardar el UserSkill (nuevo o actualizado)
        await userSkill.save();

        // Buscar skill
        let skill =  await Skill.findOne({ set: skillTreeName, taskID: skillId });

        if(!skill){
            return res.status(404).json({ message: 'Skill not found' });
        }


        // Actualizar el atributo completedSkills del usuario que haya enviado la evidencia
        const targetUser = await User.findById(userSkill.user);
        if (userSkill.completed && !targetUser.completedSkills.some(item => JSON.stringify(item) === JSON.stringify(skill))) {
            targetUser.completedSkills.push(skill);
            //Guardar el User
            await targetUser.save();
        }

        // + cargar la página de nuevo para que el usuario no pueda dar otra vez al botón

        // Responder con un mensaje de éxito
        res.status(200).json({
            message: 'Evidence verified correctly',
            userSkill: userSkill
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};