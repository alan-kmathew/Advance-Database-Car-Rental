const express = require('express');

const { logger } = require('../util/logging');
const { route } = require('../app');

const router = express.Router();

router.get('/', (req, res) => {
    logger.silly('Health check');
    res.send(`Server is up and running at ${new Date()}`);
});

router.use('api/car', require('./car.router'));

module.exports = router;
