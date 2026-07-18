const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB Connection Error: ', error);
        });
        mongoose.connection.once('open', () => {
            console.log('MongoDB connection is open');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        await mongoose.connect(process.env.MONGO_URI);
        if (process.env.NODE_ENV === 'development') {
            mongoose.set('debug', true);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;