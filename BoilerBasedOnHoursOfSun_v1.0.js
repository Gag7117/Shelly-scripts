let CONFIG = {
  accuWeatherAPIKEY: "YOUR_API_KEY",
  weatherForecastEndpoint:
    "http://dataservice.accuweather.com/forecasts/v1/daily/1day/",
  weatherCurrentEndpoint:
    "http://dataservice.accuweather.com/currentconditions/v1/",
  locations: {
    Timisoara: 290867,
    Sofia: 51097,
  },
  //check every 24h
  checkInterval: 1000 * 60 * 60 * 24, // check weather forecast once every 24h (value in ms)
  boilerSwitchThreshold: 1, //HoursOfSun value in hours, for determining whether to activate the electric boiler
};

function getWeatherURLForLocation(location) {
  return (
    CONFIG.weatherForecastEndpoint +
    JSON.stringify(CONFIG.locations[location]) +
    "?apikey=" +
    CONFIG.accuWeatherAPIKEY +
    "&details=true"
  );
}

function activateSwitch(activate) {
  Shelly.call(
    "Switch.Set",
    { id: 0, on: activate },
    function (response, error_code, error_message) {}
  );
}

function callback(location) {
  Shelly.call(
    "http.get",
    { url: getWeatherURLForLocation(location) },
    function (response, error_code, error_message, location) {
      let weatherData = JSON.parse(response.body);
      let SunTime = weatherData.DailyForecasts[0].HoursOfSun;
      print("Expected hours of Sun for tomorrow:", SunTime);
      if (SunTime <= CONFIG.boilerSwitchThreshold) {
        activateSwitch(true);
        print("Electric water heating ON")
      }
      if (SunTime > CONFIG.boilerSwitchThreshold) {
        activateSwitch(false);
        print("Free hot water!")
      }
    },
    location
  );
}

callback("Timisoara");
// Set up a regular interval - 24h - to check the expected HoursOfSun for next day
Timer.set(CONFIG.checkInterval, true, callback, "Timisoara");
