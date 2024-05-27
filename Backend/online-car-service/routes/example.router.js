const { Router } = require('express');
const { validationResult } = require('express-validator');
const { logger } = require('../util/logging');

const router = new Router();

router.post('/add', async (req, res) => {
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

        return res.status(200).json({
            name: 'Gautham',
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Bad Request',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

router.get('/get', async (req, res) => {
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

        return res.status(200).json({
            name: 'Gautham',
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({
            timestamp: new Date(),
            status: 500,
            error: 'Bad Request',
            message: err.message,
            path: `${req.baseUrl}${req.path}`,
        });
    }
});

module.exports = router;
