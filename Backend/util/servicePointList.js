const mongoose = require('mongoose');
const dbService = require('../db/dbconfig/db');
const { logger } = require('../util/logging');
const { idToLocation } = require('../util/idToLocation');

const servicePointList = async () => {
    const redisClient = await dbService.connectRedis();
    const cacheKey = 'servicePointsList';

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            logger.info('Fetching service points from Redis cache');
            await redisClient.disconnect();
            logger.info('Closing Redis connection');
            return JSON.parse(cachedData);
        }
        const db = mongoose.connection;
        const servicePoints = await db.collection('servicePoints').find({}, { projection: { _id: 1, name: 1, image: 1 } }).toArray();
        logger.info('Fetching service points from MongoDB');

        // Fetch coordinates for each service point and count the number of cars
        for (let i = 0; i < servicePoints.length; i++) {
            const coordinates = await idToLocation(servicePoints[i]._id);
            const servicePoint = await db.collection('servicePoints').findOne({ _id: servicePoints[i]._id });
            const carsCount = servicePoint.cars.length;
            servicePoints[i].coordinates = coordinates;
            servicePoints[i].totalCars = carsCount;
        }
        await redisClient.set(cacheKey, JSON.stringify(servicePoints), {
            EX: 3600,
        });
        logger.info('Storing service points data in Redis cache');

        await redisClient.disconnect();
        logger.info('Closing Redis connection');

        return servicePoints;
    } catch (error) {
        logger.error('Error fetching service points:', error);
        throw error;
    }
};

module.exports = { servicePointList };