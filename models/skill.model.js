const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    set: {
        type: String,
        required: true
    },
    tasks: {
        type: Array,
        default: [],
        required: true
    },
    resources: {
        type: Array,
        default: [],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 1,
        min: 1,
        max: 999
    }
});

module.exports = mongoose.model('Skill', skillSchema);