const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use the environment variable or fallback to local
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kn_marketplace';
        
        // Options (only needed for Mongoose < 6, but safe to keep)
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
        // Instead of exiting immediately, you might want to retry or log.
        // For production, you may want to exit only if fatal.
        process.exit(1);
    }
};

module.exports = connectDB;