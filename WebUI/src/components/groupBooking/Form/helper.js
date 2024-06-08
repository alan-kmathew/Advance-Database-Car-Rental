const BASE_API = "http://localhost:8020/api/car";

export const getRentPlan = (requirements, carType, setPlan) => {
  let data = {};
  let plan = {};
  let planTotalCount = {};
  requirements.map((requirement) => {
    plan[requirement.city] = {
      remainingCarsNeeded: requirement.carsNeeded,
      carsFromServiceStations: [],
      location: null,
      requirement: { type: carType, count: requirement.carsNeeded },
    };
  });

  const getData = () => {
    let serviceStationsPromises = [];
    for (let requirement of requirements) {
      const promise = fetch(
        `${BASE_API}/get/nearest/serviceStationDetailed?cityName=${requirement.city}`
      )
        .then((response) => response.json())
        .then((response) => {
          data[requirement.city] = response;
          plan[requirement.city].location = {
            lat: response.requestCityLocation.lat,
            lon: response.requestCityLocation.lon,
          };
        });
      serviceStationsPromises.push(promise);
    }

    let carCountPromises = [];
    // wait till we get the response from all the apis called above
    Promise.all(serviceStationsPromises).then(() => {
      for (let city of Object.keys(data)) {
        // find out how many cars are available in each of the service station near to the requirement cities
        let nearestServiceStations = data[city].nearestServiceStationResult;
        for (let [index, serviceStation] of nearestServiceStations.entries()) {
          const promise = fetch(
            `${BASE_API}/get/cars?servicePointName=${serviceStation.locatedInCity}&carCategory=${carType}`
          )
            .then((response) => response.json())
            .then(
              (response) =>
                (nearestServiceStations[index].totalCarsAvailable =
                  response.totalCarsAvailable ? response.totalCarsAvailable : 0)
            );
          carCountPromises.push(promise);
        }
      }
      // wait till we get the response from all the apis called above
      Promise.all(carCountPromises).then(() => {
        createPlan();
      });
    });
  };

  const createPlan = () => {
    requirements.map((requirement) => {
      let serviceStations = data[requirement.city].nearestServiceStationResult;
      for (let serviceStation of serviceStations) {
        let carsAlreadyAllocated = 0;
        if (planTotalCount[serviceStation.locatedInCity])
          carsAlreadyAllocated = planTotalCount[serviceStation.locatedInCity];
        let computedTotalCarsAvailable =
          serviceStation.totalCarsAvailable - carsAlreadyAllocated;

        if (
          computedTotalCarsAvailable >=
          plan[requirement.city].remainingCarsNeeded
        ) {
          allocateCarsForPlan(
            plan[requirement.city].remainingCarsNeeded,
            requirement.city,
            serviceStation.locatedInCity,
            serviceStation.latitude,
            serviceStation.longitude
          );
        } else {
          if (computedTotalCarsAvailable > 0) {
            allocateCarsForPlan(
              computedTotalCarsAvailable,
              requirement.city,
              serviceStation.locatedInCity,
              serviceStation.latitude,
              serviceStation.longitude
            );
          }
        }
      }
    });
    console.dir(plan, { depth: 5 });

    setPlan(plan);
  };

  const allocateCarsForPlan = (
    carCount,
    requirementCity,
    serviceStationCity,
    lat,
    lon
  ) => {
    // helper function to move `carCount` cars from `serviceStation` to the user's `requirementCity`
    if (carCount == 0) return;
    plan[requirementCity].remainingCarsNeeded -= carCount;
    plan[requirementCity].carsFromServiceStations.push({
      name: serviceStationCity,
      count: carCount,
      location: { lat, lon },
    });
    if (planTotalCount[serviceStationCity]) {
      planTotalCount[serviceStationCity] += carCount;
    } else planTotalCount[serviceStationCity] = carCount;
  };

  return getData();
};
