const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
   user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
   },
    skill: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Skill',
         required: true
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    completedAt: {
        type: Date,
        required: true
    },
    evidence: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    verifications: {
        type: Array,
        default: [],
        required: true
    }
});