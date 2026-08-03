const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use environment variable or fallback to local MongoDB
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kn_marketplace';

        // Options (only needed for Mongoose < 6, but harmless to keep)
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        await mongoose.connect(uri, options);
        console.log('✅ MongoDB Connected Successfully');

        // Optional: log connection events for debugging
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });
        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });
        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        // Exit the process with failure
        process.exit(1);
    }
};

module.exports = connectDB;