const { ServicePoint, Car, BookingsModel } = require('../db/model/schema');
const { logger } = require('../util/logging');
const mongoose = require('mongoose');
const moment = require('moment');
const { faker } = require('@faker-js/faker');
const axios = require('axios'); // Import axios

const executeShortestPathQuery = async (session, fromLocation, toLocation) => {
    console.log('inside executeShortestPathQuery');
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
            MATCH (start:City {name: $fromLocation}), (end:City {name: $toLocation})
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

        const result = await session.run(dijkstraQuery, {
            fromLocation,
            toLocation,
        });

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


const executeMultipleCitiesShortestPathQuery = async (session, cityLists) => {
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

        const travellingSalesManQueryQuery = `
        WITH $cityLists as cityNames 
        MATCH (c:City)
        WHERE c.name in cityNames
        WITH collect(c) as cities
        with cities, head([c in cities WHERE c.name = $cityLists[0]]) as startCity
        UNWIND cities as c1
        WITH startCity,c1, [c IN cities WHERE id(c) > id(c1)] AS c2s, cities
        UNWIND c2s AS c2
        CALL gds.shortestPath.dijkstra.stream('germanCitiesGraph',{
        sourceNode: id(c1),
        targetNode: id(c2),
        relationshipWeightProperty: "miles"
        }) YIELD nodeIds, totalCost
        WITH c1, c2, totalCost, nodeIds as shortestHopNodeIds, cities, startCity
        MERGE (c1)-[r:SHORTEST_ROUTE_TO]->(c2)
        SET r.cost = totalCost, r.shortestHopNodeIds = shortestHopNodeIds
 
        WITH startCity, c1, c2, cities, (size(cities) - 1) as level
        CALL apoc.path.expandConfig(
        startCity, 
        { relationshipFilter: 'SHORTEST_ROUTE_TO', 
            minLevel: level, 
            maxLevel: level, 
            whitelistNodes: cities, 
            terminatorNodes: [c2], 
            uniqueness: 'NODE_PATH' }
        ) 
        YIELD path 
        WITH nodes(path) as orderedCities,
            [n IN nodes(path) | id(n)] AS ids,
            reduce(cost = 0, x in relationships(path) | cost + x.cost) as totalDistanceToCover,
            [r IN relationships(path) | r.shortestHopNodeIds] AS shortestRouteNodeIds
        ORDER BY totalDistanceToCover LIMIT 1 
 
        UNWIND range(0, size(orderedCities) - 1) as index 
        WITH orderedCities, totalDistanceToCover, index, ids, 
            shortestRouteNodeIds[index] as currentShortestRouteNodeIds,
            ids[index] as currentId
        WITH orderedCities, totalDistanceToCover, 
            CASE 
            WHEN size(currentShortestRouteNodeIds) > 0 AND currentShortestRouteNodeIds[0] = currentId
            THEN [n IN currentShortestRouteNodeIds | n]
            ELSE reverse([n IN currentShortestRouteNodeIds | n])
            END as orderedHopNodeIds 
        WITH distinct orderedHopNodeIds, orderedCities, totalDistanceToCover
        UNWIND orderedHopNodeIds as orderedHopNodeId 
        MATCH (c: City) WHERE id(c) = orderedHopNodeId
        RETURN 
        [c IN orderedCities | c.name] as cityNames,
        [city in collect(distinct c) |{
        cityname: city.name,
        latitude: city.latitude,
        longitude:city.longitude
        }] as routeDetails,
        totalDistanceToCover
        LIMIT 1;
      `;

        const deleteGraphQuery = `
        CALL gds.graph.drop('germanCitiesGraph') YIELD graphName;
      `;

        await session.run(createGraphQuery);

        const result = await session.run(travellingSalesManQueryQuery, { cityLists });
        const multipleCityshortestPathResult = result.records.map(record => ({
            routeDetails: record.get('routeDetails'),
            totalDistanceInMiles: record.get('totalDistanceToCover'),
            cityNames: record.get('cityNames'),
        }));

        await session.run(deleteGraphQuery);

        return multipleCityshortestPathResult;
    } catch (error) {
        logger.error('Error executing travelling salesman query:', error);
    }
};

const transferCarsBetweenStations = async (fromStationId, deliveryStations) => {
    try {
        const allCarIds = deliveryStations.flatMap(station => station.carListToDeliver);

        const removeResult = await ServicePoint.findByIdAndUpdate(
            fromStationId,
            { $pull: { cars: { $in: allCarIds } } },
            { new: true }
        );

        if (!removeResult) {
            console.log('From station not found');
            return { success: false, message: 'From station not found' };
        }
        const addResults = [];

        for (const { stationId, carListToDeliver } of deliveryStations) {
            const addResult = await ServicePoint.findByIdAndUpdate(
                stationId,
                { $addToSet: { cars: { $each: carListToDeliver } } },
                { new: true }
            );

            if (!addResult) {
                addResults.push({ success: false, stationId, message: 'Service point not found' });
            } else {
                addResults.push({ success: true, stationId, data: addResult });
            }
        }

        return { success: true, removeResult, addResults };
    } catch (error) {
        console.error('Error transferring cars between service points:', error);
        return { success: false, message: error.message };
    }
};

const getCarsByServiceStationId = async serviceStationId => {
    try {
        const servicePoint = await ServicePoint.findById(serviceStationId)
            .populate({
                path: 'cars',
            })
            .exec();
        return servicePoint;
    } catch (error) {
        logger.error('Error fetching cars by service station id:', error);
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
            otherCity.longitude AS Longitude,
            otherCity.latitude AS Latitude,
            DistanceInMiles
      ORDER BY DistanceInMiles ASC
      LIMIT 6; 
    `;

        const result = await session.run(fetchNearestServiceStationQuery);
        const nearestServiceStationResult = result.records.map(record => ({
            serviceStationID: record.get('ServiceStationID'),
            locatedInCity: record.get('LocatedInCity'),
            distanceInMiles: record.get('DistanceInMiles'),
            latitude: record.get('Latitude'),
            longitude: record.get('Longitude'),
        }));
        for (let nearestServiceStation of nearestServiceStationResult) {
            const serviceStation = await getCarsByServiceStationId(
                nearestServiceStation.serviceStationID
            );
            nearestServiceStation.carList = serviceStation.cars;
            nearestServiceStation.image = serviceStation.image;
        }

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

const getCarsByServiceStation = async (servicePointName, carCategory) => {
    try {
        const servicePoint = await ServicePoint.findOne({
            name: new RegExp(`^${servicePointName}$`, 'i'),
        })
            .populate({
                path: 'cars',
                match: { type: new RegExp(`^${carCategory}$`, 'i') },
            })
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
                const nearestServiceStations = await executeNearestServiceStationQuery(
                    session,
                    result.servicePointName
                );

                result.nearestServiceStations = nearestServiceStations.filter(
                    station => station.locatedInCity !== `${result.servicePointName}`
                );
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

const getRideSharingCarDetails = async (source_location, destination_location, travel_date, nearyByServiceStations) => {
    if (!source_location || !destination_location || !travel_date) {
        throw new Error('All fields are required');
    }
    const travelDate = moment(travel_date); // Assuming travel_date is a string
    console.log("travelDate------------>", travelDate);
    const serviceStationIds = nearyByServiceStations.map(station => new mongoose.Types.ObjectId(station.serviceStationID));
    console.log("serviceStationIds--------------->", serviceStationIds);

    try {
        // Fetch the service stations data
        const serviceStationsResponse = await axios.get('http://localhost:8020/api/car/get/servicePoints');
        const serviceStations = serviceStationsResponse.data;
        const availableBookingsArray = await BookingsModel.aggregate([
            {
                $match: {
                    servicePointId: { $in: serviceStationIds },
                    destination: destination_location,
                    type: 'sharing'
                },
            },
            {
                $lookup: {
                    from: 'cars',
                    localField: 'carId',
                    foreignField: '_id',
                    as: 'carDetails',
                },
            },
            {
                $unwind: '$carDetails',
            },
            {
                $match: {
                    'carDetails.seats': { $gt: 0 },
                },
            },
            {
                $project: {
                    _id: 1,
                    startDate: 1,
                    endDate: 1,
                    customer: 1,
                    price: 1,
                    servicePointId: 1,
                    type: 1,
                    bookingDate: 1,
                    destination: 1,
                    carId: 1,
                    'carDetails.model': 1,
                    'carDetails.type': 1,
                    'carDetails.category': 1,
                    'carDetails.basePrice': 1,
                    'carDetails.color': 1,
                    'carDetails.plateNo': 1,
                    'carDetails.image': 1,
                    'carDetails.seats': 1,
                },
            },
            {
                $group: {
                    _id: "$type",
                    details: {
                        $push: {
                            _id: "$_id",
                            startDate: "$startDate",
                            endDate: "$endDate",
                            customer: "$customer",
                            price: "$price",
                            servicePointId: "$servicePointId",
                            type: "$type",
                            bookingDate: "$bookingDate",
                            destination: "$destination",
                            carId: "$carId",
                            carDetails: "$carDetails",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    details: 1,
                },
            },
        ]).exec();

        console.log("availableBookingsArray-------->", JSON.stringify(availableBookingsArray));

        if (!availableBookingsArray || availableBookingsArray.length === 0) {
            throw new Error('No available bookings found');
        }

        let filteredSharingBookings = availableBookingsArray[0].details.filter(car => {
            const startDate = moment(car.startDate);
            const endDate = moment(car.endDate);
            return travelDate.isBetween(startDate, endDate, null, '[]');
        });

        console.log("filteredBookings--------------->", filteredSharingBookings);

        // Add coordinates to the bookings
        const addCoordinates = (bookings) => {
            return bookings.map(booking => {
                const serviceStation = serviceStations.find(station => station._id === booking.servicePointId.toString());
                return {
                    ...booking,
                    coordinates: serviceStation ? serviceStation.coordinates : null,
                };
            });
        };

        filteredSharingBookings = addCoordinates(filteredSharingBookings);

        return {
            filteredBookings: filteredSharingBookings
        };

    } catch (error) {
        console.error(error);
        throw new Error('Error fetching ride sharing car details');
    }
};

const getCoordinatesOfCity = async (session, cityName) => {
    try {
        const fetchCoordinatesQuery = `
        WITH "${cityName}" AS targetCityName
        MATCH (targetCity:City {name: targetCityName})
        RETURN 
        targetCity.name AS name,
        targetCity.latitude AS lat,
        targetCity.longitude AS lon;
      `;
        const result = await session.run(fetchCoordinatesQuery);
        return result.records[0].toObject();
    } catch (error) {
        logger.error('Error fetching coordinates:', error);
    }
};

const insertBooking = async (payload, session) => {
    const newBooking = await BookingsModel.create([payload], { session });
    return newBooking;
};

const updateCarSeats = async (carId, session) => {
    await Car.updateOne({ _id: carId }, { $inc: { seats: -1 } }, { session });
};

const checkPossibleToShareTheCar = async (
    neo4jSession,
    source_location,
    destination_location,
    travel_date,
    carId
) => {
    if (!source_location || !destination_location || !travel_date) {
        throw new Error('All fields are required');
    }
    const travelDate = moment(travel_date).startOf('day');
    const randomName = faker.person.fullName();
    const randomEmail = faker.internet.email();
    console.log("source_location",source_location);
    console.log("destination_location",destination_location);
    console.log("travel_date",travel_date);
    console.log("carId",carId);
    
    try {
        const carBooking = await BookingsModel.findOne({
            type: 'sharing',
            destination: destination_location,
            carId: new mongoose.Types.ObjectId(carId),
        }).exec();

        if (!carBooking) {
            throw new Error('Car booking not found');
        }
        //get name of servicepointId and get  coordinate details for source and destination
        const serviceStationId = carBooking.servicePointId.toString();
        const query = `
            MATCH (s:ServiceStations {serviceStationId: $serviceStationId})
            RETURN s.serviceStationName AS serviceStationName`;

        const result = await neo4jSession.run(query, { serviceStationId });
        const serviceStationName = result.records[0]?.get('serviceStationName');

        if (!serviceStationName) {
            throw new Error('Service station name not found');
        }
        // const source_location_cords = await getCoordinatesForLocation(serviceStationName);
        // const destination_location_cords = await getCoordinatesForLocation(carBooking.destination);
        console.log('serviceStationName----------_>', serviceStationName);
        console.log('carBooking.destination------------------>', carBooking.destination);
        // Fetch the route using the provided API
        const apiUrl = `http://localhost:8020/api/car/get/shortestpath?fromLocation=${encodeURIComponent(
            serviceStationName
        )}&toLocation=${encodeURIComponent(carBooking.destination)}`;
        console.log('apiUrl-------------->', apiUrl);
        const routeResponse = await axios.get(apiUrl);
        const route = routeResponse.data[0];
        console.log('route----------------->', route.routeDetails);

        const passenger_source_cords = await getCoordinatesForLocation(source_location);


        // Parse the passenger location
        const passengerLocation = {
            lat: passenger_source_cords.lat,
            lng: passenger_source_cords.lon,
        };

        // Check if the passenger's location is on the route
        if (!isPassengerOnRoute(passengerLocation, route.routeDetails)) {
            throw new Error('Passenger location is not along the route');
        }

        const payload = {
            carId: carBooking.carId,
            startDate: travelDate.toDate(),
            endDate: travelDate.toDate(),
            customer: {
                name: randomName,
                email: randomEmail,
            },
            price: 0, // Assuming price logic to be added
            servicePointId: carBooking.servicePointId,
            type: 'passenger',
            bookingDate: new Date(),
            destination: destination_location,
            source_location: source_location,
        };

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Insert the new booking
            const newBooking = await insertBooking(payload, session);

            // Update the car seats
            await updateCarSeats(carBooking.carId, session);

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            return { message: 'Booking successful', booking: newBooking };
        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            throw transactionError;
        }
    } catch (error) {
        console.error('Error fetching ride sharing car details:', error);
        throw error;
    }
};

const fetchRoute = async (start, end) => {
    const apiKey = 'GJ9cH5kbfx3i5WfUALY8huGPqfwOlxN0';
    const response = await fetch(
        `https://api.tomtom.com/routing/1/calculateRoute/${start.lat},${start.lon}:${end.lat},${end.lon}/json?key=${apiKey}&routeType=fastest`
    );
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found in response');
    }

    const route = data.routes[0];

    if (!route.legs || route.legs.length === 0) {
        throw new Error('No legs found in route');
    }

    const leg = route.legs[0];

    if (!leg.points || leg.points.length === 0) {
        throw new Error('No points found in leg');
    }

    return leg.points.map(point => ({
        lat: point.latitude,
        lng: point.longitude,
    }));
};

const haversine = (location1, location2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    console.log('location1------------->', location1, location2);
    const lat1 = location1.lat;
    const lon1 = location1.lng;
    const lat2 = location2.latitude;
    const lon2 = location2.longitude;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const isPassengerOnRoute = (passengerLocation, route, maxDistance = 25.0) => {
    console.log;
    console.log('route------------>', route);
    for (const waypoint of route) {
        const distance = haversine(passengerLocation, waypoint);
        if (distance <= maxDistance) {
            return true;
        }
    }
    return false;
};

async function getCoordinatesForLocation(locationName) {
    const TOMTOM_API_KEY = 'GJ9cH5kbfx3i5WfUALY8huGPqfwOlxN0';
    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
        locationName
    )}.json?key=${TOMTOM_API_KEY}`;
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
        return response.data.results[0].position;
    } else {
        throw new Error(`No coordinates found for location: ${locationName}`);
    }
}

const fetchPassengerBookings = async (fromDate, toDate, source_location_id, destination_location) => {
    console.log("inside passenger bookings");

    // Ensure dates are properly parsed
    const fromDateParsed = parseAndValidateDate(fromDate);
    const toDateParsed = parseAndValidateDate(toDate);
    const servicePointObjectId = new mongoose.Types.ObjectId(source_location_id);

    console.log("date", fromDateParsed, toDateParsed);

    // Fetch service stations data
    const serviceStationsResponse = await axios.get('http://localhost:8020/api/car/get/servicePoints');
    const serviceStations = serviceStationsResponse.data;

    // Find the name of the service station
    const serviceStation = serviceStations.find(station => station._id === servicePointObjectId.toString());
    if (!serviceStation) {
        throw new Error('Service station not found');
    }
    const serviceStationName = serviceStation.name;

    console.log("serviceStationName---------->", serviceStationName);

    // Query MongoDB to find passenger bookings matching the criteria
    const passengerBookings = await BookingsModel.find({
        type: 'passenger',
        destination: destination_location,
        servicePointId: servicePointObjectId,
        $or: [
            // Case 1: Booking starts within the given range
            { startDate: { $gte: fromDateParsed, $lte: toDateParsed } },
            // Case 2: Booking ends within the given range
            { endDate: { $gte: fromDateParsed, $lte: toDateParsed } },
            // Case 3: Booking period fully encompasses the given range
            { startDate: { $lte: fromDateParsed }, endDate: { $gte: toDateParsed } }
        ]
    }).exec();

    console.log("passengerBookings--------------->", passengerBookings);
    if (!passengerBookings || passengerBookings.length === 0) {
        throw new Error('No passenger bookings found for the given criteria');
    }
    // Structure the response data
    const passengerData = passengerBookings.map(booking => ({
        name: booking.customer.name,
        source_location: booking.source_location
    }));

    const response = {
        serviceStationName: serviceStationName,
        passengerData: passengerData,
        destination: destination_location
    };

    return response;
};



const parseAndValidateDate = (dateString) => {
    console.log("dateString",dateString);
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date format: ${dateString}`);
    }
    return parsedDate;
};

module.exports = { getRideSharingCarDetails };

module.exports = {
    executeShortestPathQuery,
    executeNearestServiceStationQuery,
    getCarsByServiceStation,
    getServiceStationWithMostBookings,
    getRideSharingCarDetails,
    executeMultipleCitiesShortestPathQuery,
    getCoordinatesOfCity,
    transferCarsBetweenStations,
    findMostSuitableNearestServiceStation,
    checkPossibleToShareTheCar,
    fetchPassengerBookings,
    fetchRoute,
    transferCarsBetweenStations,
};
