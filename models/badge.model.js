const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    bitpoints_min: {
        type: Number,
        default: 0,
        min: 0,
        max: 999,
        required: true
    },
    bitpoints_max: {
        type: Number,
        default: 0,
        min: 0,
        max: 999,
        required: true
    },
    image_url: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Badge', badgeSchema);
