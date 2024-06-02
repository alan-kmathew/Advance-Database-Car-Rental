const { logger } = require('../util/logging');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const findCarForRental = async (redisClient, servicePointId, startDate, endDate) => {
    const cacheKey = `available_cars:${servicePointId}:${startDate}:${endDate}`;
    
    try { 
    // Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        logger.info('Fetching data from Redis cache');
        return JSON.parse(cachedData);
    }
    
// If not in cache, query MongoDB
const db = mongoose.connection;
const servicePointObjectId = new ObjectId(servicePointId);
const start = new Date(startDate);
const end = new Date(endDate);

const bookings = await db.collection('cars').aggregate([
    {
        $match: {
            servicePointId: servicePointObjectId
        }
    },
    {
        $lookup: {
            from: "bookings",
            localField: "_id",
            foreignField: "carId",
            as: "bookings"
        }
    },
    {
        $addFields: {
            available: {
                $not: {
                    $anyElementTrue: {
                        $map: {
                            input: "$bookings",
                            as: "booking",
                            in: {
                                $and: [
                                    { $lt: ["$$booking.startDate", endDate] },
                                    { $gt: ["$$booking.endDate", startDate] }
                                ]
                            }
                        }
                    }
                }
            }
        }
    },
    {
        $match: {
            available: true
        }
    },
    {
        $project: {
            bookings: 0,
            available: 0
        }
    }
]).toArray();
// console.log(bookings);

    // Cache the results in Redis
    await redisClient.set(cacheKey, JSON.stringify(bookings), {
        EX: 3600 
    });

    return bookings;
} catch (err) {console.error(err); }

};

module.exports = { findCarForRental };


