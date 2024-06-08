const mongoose = require('mongoose');
const dbService = require('../db/dbconfig/db');
const { logger } = require('../util/logging');

createBooking = async (booking) => {
    const redisClient = await dbService.connectRedis();
    const cacheKey = 'bookingList';
    try {
        const db = mongoose.connection;
        const bookingCollection = db.collection('bookings');
        const carCollection = db.collection('cars'); 
        const car = await carCollection.findOne({ _id: new mongoose.Types.ObjectId(booking.carId) });
        if (!car) {
            throw new Error('Car not found');
        }

        const newBooking = await bookingCollection.insertOne(booking);
        if (newBooking) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                const bookingList = JSON.parse(cachedData);
                bookingList.push(booking);
                await redisClient.set(cacheKey, JSON.stringify(bookingList), 'EX', 3600); // time 1 hour
                logger.info('Storing booking data in Redis cache');
            }
            return { ...booking, plateNo: car.plateNo };
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

module.exports = { createBooking };
