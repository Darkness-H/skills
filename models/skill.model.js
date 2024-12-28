const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    taskID: {
        type: Number,
        required: true
    },
    text: {
        type: [String],
        required: true
    },
    icon: {
        type: String,
        required: false
    },
    set: {
        type: String,
        required: true
    },
    tasks: {
        type: [String],
        default: []
    },
    resources: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Skill', skillSchema);