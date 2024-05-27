const mongoose = require('mongoose');
const { logger } = require('../../util/logging');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/' + process.env.MONGODB_DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
