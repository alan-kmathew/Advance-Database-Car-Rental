const { Router } = require('express');
const { validationResult } = require('express-validator');
const { logger } = require('../util/logging');
const { findCarForRental } = require('../services/carRental.service');
const { idToLocation } = require('../util/IdToLocation');
const { servicePointList } = require('../util/servicePointList');
const { createBooking } = require('../services/booking.service');
const calculatePrice = require('../util/priceCalculation');
const { mapLocationList } = require('../util/mapLocationList');
const {
    executeShortestPathQuery,
    executeNearestServiceStationQuery,
    getCarsByServiceStation,
    getServiceStationWithMostBookings,
    getRideSharingCarDetails,
    executeMultipleCitiesShortestPathQuery,
} = require('../services/car.services');
const dbService = require('../db/dbconfig/db');

const router = new Router();

/**
 * Get the shortest path between two locations
 */
router.get('/get/shortestpath', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const neo4jSession = await dbService.connectNeo4j();
        const shortestPathResult = await executeShortestPathQuery(
            neo4jSession,
            req.query.fromLocation,
            req.query.toLocation
        );
        return res.status(200).json(shortestPathResult);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/**
 * Get the shortest path between multiple locations
 */
router.post('/shortestpath', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        if (
            !req.body.cityLists ||
            !Array.isArray(req.body.cityLists) ||
            req.body.cityLists.length < 2
        ) {
            return res.status(400).send({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: 'Please provide at least two city names.',
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const neo4jSession = await dbService.connectNeo4j();
        const multipleCityShortestPathResult = await executeMultipleCitiesShortestPathQuery(
            neo4jSession,
            req.body.cityLists
        );
        return res.status(200).json(multipleCityShortestPathResult);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/**
 * Get the nearest service station for given location
 */
router.get('/get/nearest/servicestation', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const neo4jSession = await dbService.connectNeo4j();
        const nearestServiceStationResult = await executeNearestServiceStationQuery(
            neo4jSession,
            req.query.cityName
        );
        return res.status(200).json(nearestServiceStationResult);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/**
 * Get total cars available at given service station
 */
router.get('/get/cars', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const carsResult = await getCarsByServiceStation(
            req.query.servicePointName,
            req.query.carCategory
        );
        if (!carsResult || carsResult.length === 0) {
            return res.status(404).json({
                timestamp: new Date(),
                status: 404,
                error: 'Not Found',
                message: `No  ${req.query.carCategory} cars found at the ${req.query.servicePointName} service station`,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        return res.status(200).json({ totalCarsAvailable: carsResult.length, cars: carsResult });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/**
 * Get the service stations with high bookings
 
 */
router.get('/get/station/highbookings', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const neo4jSession = await dbService.connectNeo4j();
        const redisClient = await dbService.connectRedis();
        const highBookingResult = await getServiceStationWithMostBookings(
            neo4jSession,
            redisClient,
            req.query.fromDate,
            req.query.toDate,
            req.query.numberOfServiceStations
        );
        if (!highBookingResult || highBookingResult.length === 0) {
            return res.status(404).json({
                timestamp: new Date(),
                status: 404,
                error: 'Not Found',
                message: `No Booking found between ${req.query.fromDate} and ${req.query.toDate}`,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        await redisClient.disconnect();
        return res.status(200).json(highBookingResult);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});


/** 
 * Get the car rental details
 */

router.get('/get/carRental', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const redisClient = await dbService.connectRedis();
        const carRentalResult = await findCarForRental(
            redisClient,
            req.query.fromLocation,
            req.query.startDate,
            req.query.endDate
        );

        const LocationCoordinates = await idToLocation(req.query.fromLocation);
        const CarsWithPrice = await calculatePrice(
            redisClient,
            carRentalResult,
            LocationCoordinates,
            req.query.startDate,
            req.query.endDate
        );

        // Close the Redis connection
        await redisClient.disconnect();
        return res.status(200).json(CarsWithPrice);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

router.post('/get/riderdetails', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const neo4jSession = await dbService.connectNeo4j();
        const nearestServiceStationResult = await executeNearestServiceStationQuery(
            neo4jSession,
            req.body.source_location
        );
        console.log(nearestServiceStationResult);
        const matchedRideSharingCarDetails = await getRideSharingCarDetails(
            req.body.source_location,
            req.body.destination_location,
            req.body.travel_date,
            nearestServiceStationResult
        );
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/** 
 * Get all service points
 */

router.get('/get/servicePoints', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const servicePoints = await servicePointList();
        return res.status(200).json(servicePoints);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/** 
 * Create a new booking
 */

router.post('/create/booking', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }

        const newBooking = await createBooking(req.body);
        if (newBooking) {
            return res.status(200).json(newBooking);
        } else {
            return res.status(404).json({ message: 'Booking not created' });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/** 
 * Get all locations in the map
 */

router.get('/get/allLocationsInMap', async (req, res) => {
    try {
        const mapLocations = await mapLocationList();
        return res.status(200).json(mapLocations);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

/** 
* Get the car rental details
*/

router.get('/get/rentedCarlist', async (req, res) => {
    logger.info(`Entering ${req.baseUrl}${req.path}`);
    try {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const erroMessage = validationErrors.array();
            return res.status(400).json({
                timestamp: new Date(),
                status: 400,
                error: 'Bad Request',
                message: erroMessage,
                path: `${req.baseUrl}${req.path}`,
            });
        }
        const redisClient = await dbService.connectRedis();
        const listOfRentedCars = await findCarForRental(
            redisClient,
            req.query.fromLocation,
            req.query.startDate,
            req.query.endDate
        );

        // Close the Redis connection
        await redisClient.disconnect();
        return res.status(200).json(listOfRentedCars);
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Internal Server Error',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

module.exports = router;
