const dbService = require('../db/dbconfig/db');
const { logger } = require('../util/logging');

const mapLocationList = async () => {
    const redisClient = await dbService.connectRedis();
    const cacheKey = 'AlllocationList';

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            logger.info('Fetching location list from Redis cache');
            await redisClient.disconnect();
            logger.info('Closing Redis connection');
            return JSON.parse(cachedData);
        }

        const session = await dbService.connectNeo4j();
        const query = `
            MATCH (c:City)
            WITH collect({name: c.name}) as cities
            RETURN apoc.convert.toJson(cities) as json
        `;

        const result = await session.run(query);
        const locations = result.records.map((record) => {
            return JSON.parse(record.get('json'));
        });

        await session.close();
        await redisClient.set(cacheKey, JSON.stringify(locations), {
            EX: 3600,
        });
        logger.info('Storing location data in Redis cache');

        await redisClient.disconnect();
        logger.info('Closing Redis connection');

        return locations;
    } catch (error) {
        logger.error('Error fetching location list:', error);
        throw error;
    }
}

module.exports = { mapLocationList };