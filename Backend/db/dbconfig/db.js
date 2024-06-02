const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const { createClient } = require('redis');
const { logger } = require('../../util/logging');
require('dotenv').config();  
let neo4jDriver;
let redisClient;

const connectMongoDB = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://' +
                process.env.MONGODB_USERNAME +
                ':' +
                process.env.MONGODB_PASSWORD +
                '@' +
                process.env.MONGODB_CLUSTER_URI,
            {
                dbName: process.env.MONGODB_DATABASE,
            }
        );
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const connectNeo4j = async () => {
    try {
        neo4jDriver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
        );
        const session = neo4jDriver.session();
        logger.info('Connected to Neo4j');
        return session;
    } catch (error) {
        logger.error('Error connecting to Neo4j:', error);
        process.exit(1);
    }
};

const connectRedis = async () => {
    try {
        redisClient = createClient({
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            }
        });
        redisClient.on('error', (err) => logger.error('Redis Client Error', err));
        await redisClient.connect();
        logger.info('Connected to Redis');
    } catch (error) {
        logger.error('Error connecting to Redis:', error);
        process.exit(1);
    }
    return redisClient;
};

const closeNeo4j = async () => {
    if (neo4jDriver) {
        await neo4jDriver.close();
    }
};

const closeRedis = async () => {
    if (redisClient) {
        await redisClient.disconnect();
    }
};

module.exports = { connectMongoDB, connectNeo4j, connectRedis, closeNeo4j, closeRedis };