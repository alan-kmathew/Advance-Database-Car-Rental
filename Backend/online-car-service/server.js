const app = require('./app');
const { logger } = require('./util/logging');
// const dbService = require('./db/dbconfig/db');

app.listen(process.env.PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});

// dbService.connectDB();
