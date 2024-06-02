const { Router } = require('express');
const { validationResult } = require('express-validator');
const { logger } = require('../util/logging');
const {
    executeShortestPathQuery,
    executeNearestServiceStationQuery,
    getCarsByServiceStation,
} = require('../services/car.services');
const dbService = require('../db/dbconfig/db');

const router = new Router();

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
        const carsResult = await getCarsByServiceStation(req.query.servicePointName);
        if (!carsResult || carsResult.length === 0) {
            return res.status(404).json({
                timestamp: new Date(),
                status: 404,
                error: 'Not Found',
                message: `No cars found at the ${req.query.servicePointName} service station`,
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

module.exports = router;
