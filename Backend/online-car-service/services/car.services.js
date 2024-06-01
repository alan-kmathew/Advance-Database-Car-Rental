// const NumbersModel = require('../db/model/schema');
// const { MongoClient, ObjectId } = require('mongodb');
const { logger } = require('../util/logging');

const executeShortestPathQuery = async (session, fromLocation, toLocation) => {
    try {
        const createGraphQuery = `
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

module.exports = { executeShortestPathQuery };
