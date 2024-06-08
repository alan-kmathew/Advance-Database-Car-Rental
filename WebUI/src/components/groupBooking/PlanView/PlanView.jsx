import "./PlanView.css";
const PlanView = ({
  plan,
  goBack,
  showSsLocationsCity,
  setShowSsLocationsCity,
}) => {
  return (
    <div className="planViewContainer">
      <p className="backButton" onClick={() => goBack()}>
        {"< Back"}
      </p>
      {Object.entries(plan).map((planItem, index) => {
        let requirement = planItem[1].requirement;
        let ssCarCounts = planItem[1].carsFromServiceStations;
        let remainingCarsNeeded = planItem[1].remainingCarsNeeded;
        return (
          <div
            key={index}
            className={`planItem ${
              showSsLocationsCity == index ? "selectedUserCity" : ""
            }`}
            onClick={() => {
              setShowSsLocationsCity(index);
            }}
          >
            <h1 className="userCityName">{planItem[0]}</h1>
            <p className="userRequirement">
              needs {requirement.count} {requirement.type}
              {requirement.count > 1 && "s"}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Service Station</th>
                  <th>Count</th>
                </tr>
              </thead>
              {ssCarCounts.map((row, i) => {
                return (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.count}</td>
                  </tr>
                );
              })}
            </table>
            {remainingCarsNeeded > 0 && (
              <p className="errorMessage">
                Need {remainingCarsNeeded} more cars from further locations
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlanView;
