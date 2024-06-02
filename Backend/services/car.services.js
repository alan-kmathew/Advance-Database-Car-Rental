const { ServicePoint, Car, BookingsModel } = require('../db/model/schema');
const { logger } = require('../util/logging');

const executeShortestPathQuery = async (session, fromLocation, toLocation) => {
    try {
        const createGraphQuery = `
        CALL gds.graph.exists('germanCitiesGraph') YIELD exists
        WITH exists
        WHERE NOT exists 
        CALL gds.graph.project(
            'germanCitiesGraph',
            'City',
            {
                DISTANCE: {
                    type: 'Distance',
                    properties: 'miles',
                    orientation: 'UNDIRECTED'
                }
            }
        )
        YIELD graphName, nodeCount, relationshipCount
        RETURN graphName, nodeCount, relationshipCount;
      `;

        const dijkstraQuery = `
        MATCH (start:City {name: "${fromLocation}"}), (end:City {name: "${toLocation}"})
        CALL gds.shortestPath.dijkstra.stream('germanCitiesGraph', {
          sourceNode: id(start),
          targetNode: id(end),
          relationshipWeightProperty: 'miles'
        })
        YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs
        RETURN
          gds.util.asNode(sourceNode).name AS fromLocation,
          gds.util.asNode(targetNode).name AS toLocation,
          totalCost AS totalDistance,
          [nodeId IN nodeIds | {
            pathName: gds.util.asNode(nodeId).name,
            latitude: gds.util.asNode(nodeId).latitude,
            longitude: gds.util.asNode(nodeId).longitude
          }] AS routeDetails
        ORDER BY totalDistance ASC;
      `;

        const deleteGraphQuery = `
        CALL gds.graph.drop('germanCitiesGraph') YIELD graphName;
      `;

        await session.run(createGraphQuery);

        const result = await session.run(dijkstraQuery);
        const shortestPathResult = result.records.map(record => ({
            fromLocation: record.get('fromLocation'),
            toLocation: record.get('toLocation'),
            totalDistance: record.get('totalDistance'),
            routeDetails: record.get('routeDetails'),
        }));

        await session.run(deleteGraphQuery);

        return shortestPathResult;
    } catch (error) {
        logger.error('Error executing query:', error);
    }
};

const executeNearestServiceStationQuery = async (session, cityName) => {
    try {
        const fetchNearestServiceStationQuery = `
      WITH "${cityName}" AS targetCityName
      MATCH (targetCity:City {name: targetCityName})
      MATCH (otherCity:City)<-[:LOCATED_IN]-(station:ServiceStations)
      WITH targetCity, otherCity, station,
        point({latitude: targetCity.latitude, longitude: targetCity.longitude}) AS targetPoint,
        point({latitude: otherCity.latitude, longitude: otherCity.longitude}) AS otherPoint,
        point.distance(point({latitude: targetCity.latitude, longitude: targetCity.longitude}), 
            point({latitude: otherCity.latitude, longitude: otherCity.longitude})) / 1609.34 AS DistanceInMiles
      RETURN station.serviceStationId AS ServiceStationID,
            otherCity.name AS LocatedInCity,
            DistanceInMiles
      ORDER BY DistanceInMiles ASC
      LIMIT 6; 
    `;

        const result = await session.run(fetchNearestServiceStationQuery);
        const nearestServiceStationResult = result.records.map(record => ({
            serviceStationID: record.get('ServiceStationID'),
            locatedInCity: record.get('LocatedInCity'),
            distanceInMiles: record.get('DistanceInMiles'),
        }));
        return nearestServiceStationResult;
    } catch (error) {
        logger.error('Error executing nerest service station query:', error);
    }
};

const getCoordinates = async (session, stationName) => {
    try {
        const fetchCoordinatesQuery = `
        WITH "${stationName}" AS stationName
        MATCH (station:ServiceStations {serviceStationName: stationName})
        MATCH (station)-[:LOCATED_IN]->(city:City)
        RETURN city.latitude AS Latitude,
        city.longitude AS Longitude;
      `;
        const result = await session.run(fetchCoordinatesQuery);
        return result.records[0].toObject();
    } catch (error) {
        logger.error('Error fetching coordinates:', error);
    }
};

const getCarsByServiceStation = async servicePointName => {
    try {
        const servicePoint = await ServicePoint.findOne({ name: servicePointName })
            .populate('cars')
            .exec();
        return servicePoint?.cars;
    } catch (error) {
        logger.error('Error fetching cars by service station name:', error);
    }
};

const getServiceStationWithMostBookings = async (
    session,
    redisClient,
    startDate,
    endDate,
    numberOfServiceStations
) => {
    try {
        const cacheKey = `service_station_with_most bookings:${startDate}:${endDate}:${numberOfServiceStations}`;
        const start = new Date(startDate);
        const end = new Date(endDate);

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            logger.info(
                `Fetching service stations with most bookings from ${startDate}- ${endDate} from Redis cache`
            );
            return JSON.parse(cachedData);
        }

        logger.info(
            `Fetching service stations with most bookings from ${startDate}- ${endDate} from mongoDB`
        );

        const mostBookingsResult = await BookingsModel.aggregate([
            {
                $match: {
                    bookingDate: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: '$servicePointId',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: parseInt(numberOfServiceStations),
            },
            {
                $lookup: {
                    from: 'servicePoints',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'servicePoint',
                },
            },
            {
                $unwind: '$servicePoint',
            },
            {
                $lookup: {
                    from: 'cars',
                    let: { carIds: '$servicePoint.cars' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$carIds'] } } },
                        { $project: { servicePointId: 0, color: 0, basePrice: 0, category: 0 } },
                    ],
                    as: 'servicePoint.cars',
                },
            },
            {
                $addFields: {
                    totalCarCount: { $size: '$servicePoint.cars' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: '$count',
                    totalCarsAvailable: '$totalCarCount',
                    servicePointId: '$servicePoint._id',
                    servicePointName: '$servicePoint.name',
                    servicePointImage: '$servicePoint.image',
                    carList: '$servicePoint.cars',
                },
            },
        ]);

        if (mostBookingsResult.length > 0) {
            for (let result of mostBookingsResult) {
                const serviceStationCoordinates = await getCoordinates(
                    session,
                    result.servicePointName
                );
                result.latitude = serviceStationCoordinates.Latitude;
                result.longitude = serviceStationCoordinates.Longitude;
            }
            await redisClient.set(cacheKey, JSON.stringify(mostBookingsResult), {
                EX: 3600,
            });
            return mostBookingsResult;
        } else {
            logger.info('No bookings found for the specified date range.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw new Error('Error fetching bookings');
    }
};

module.exports = {
    executeShortestPathQuery,
    executeNearestServiceStationQuery,
    getCarsByServiceStation,
    getServiceStationWithMostBookings,
};
