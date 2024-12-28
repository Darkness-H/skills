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
        default: false
    },
    completedAt: {
        type: Date
    },
    evidence: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifications: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        approved: {
            type: Boolean,
            required: true
        },
        verifiedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('UserSkill', userSkillSchema);