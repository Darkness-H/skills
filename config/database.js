const mongoose = require('mongoose');
const fs = require('fs');
const Skill = require('../models/skill.model');
const Badge = require('../models/badge.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectSW');
        console.log('MongoDB conectado');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);

        // Comprobar si la colección 'badges' ya existe
        if (!collectionNames.includes('badges')) {
            console.log('Collection "badges" does not exist. Uploading data...');
            const badgesData = JSON.parse(fs.readFileSync('./public/js/scripts/badges.json', 'utf-8'));
            for (const badge of badgesData) {
                await Badge.create(badge);
            }
            console.log('Badge data successfully uploaded.');
        } else {
            console.log('Collection "badges" already exists. Skipping upload.');
        }

        // Comprobar si la colección 'skills' ya existe
        if (!collectionNames.includes('skills')) {
            console.log('Collection "skills" does not exist. Uploading data...');
            const skillsData = JSON.parse(fs.readFileSync('./public/js/scripts/skills_complete.json', 'utf-8'));
            for (const skill of skillsData) {
                await Skill.create(skill);
            }
            const otherSkillsData = JSON.parse(fs.readFileSync('./public/js/scripts/otherSkills_complete.json', 'utf-8'));
            for (const skill of otherSkillsData) {
                await Skill.create(skill);
            }
            console.log('Skill data successfully uploaded.');
        } else {
            console.log('Collection "skills" already exists. Skipping upload.');
        }

    } catch (error) {
        console.error('Error en la conexión a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;