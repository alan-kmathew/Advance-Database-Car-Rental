const { model } = require("mongoose");
const logger = require("../util/logging");


createBooking = async (booking) => {
    const redisClient = await dbService.connectRedis();
    const cacheKey = 'bookingList';
    try {
        const db = mongoose.connection;
        const bookingCollection = db.collection('booking');
        const newBooking = await bookingCollection.insertOne(booking);
        if (newBooking) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                const bookingList = JSON.parse(cachedData);
                bookingList.push(booking);
                await redisClient.set(cacheKey, JSON.stringify(bookingList), 'EX', 3600); // time 1 hour
                logger.info('Storing booking data in Redis cache');
            }
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logger.error('Error creating booking:', error);
        throw error;
    } finally {
        await redisClient.disconnect();
        logger.info('Closing Redis connection');
    }
}

model.exports = { createBooking };