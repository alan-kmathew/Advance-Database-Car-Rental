const { ServicePoint, Car } = require('../db/model/schema');
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

module.exports = {
    executeShortestPathQuery,
    executeNearestServiceStationQuery,
    getCarsByServiceStation,
};
