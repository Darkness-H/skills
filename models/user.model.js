const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 999
    },
    admin: {
        type: Boolean,
        default: false
    },
    completedSkills: {
        type: Array,
        default: []
    }
});

/*
// Middleware para hacer que el primer caracter del username sea mayúscula
userSchema.pre('save', function(next) {
    this.username = this.username.charAt(0).toUpperCase() + this.username.slice(1);
    next();
});
*/

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            console.log('Hashing password for user:', this.username);
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        console.error('Error in password hashing:', error);
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);