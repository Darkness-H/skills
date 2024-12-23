const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectSW');
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error en la conexión a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;