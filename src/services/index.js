const { Client } = require('pg');
let queries = require('./queries');

let fetch_current_conditions = () => {
    try {
      console.log(`fetching current conditions`);
  
      // Query the database for the current conditions and return them
      return client.query(queries.current_conditions_query)
        .then(result => {
          console.log(`fetched current conditions`);
  
          return conditions = {
            obs: result.rows[0].time,
            temperate_f: result.rows[0].temp_f,
            humidty_perc: result.rows[0].humidity,
            wind_dir: result.rows[0].wind_dir,
            wind_speed_mph: result.rows[0].wind_kph,
            rainfall_rate_in: result.rows[0].rain_rate
          };
        }).catch(err => {
          console.log(`error fetching current conditions`);
          console.log(err);
        });
    }
    catch (err) {
      console.log(`error fetching current conditions`);
      console.log(err);
    }
  }
  
  let fetch_almanac = () => {
    try {
      console.log(`fetching today's alamanac`);
  
      // Query the database for the current conditions and return them
      return client.query(queries.almanac_query)
        .then(result => {
          console.log(`fetched daily almanac`);
  
          return almanac = {
            obs: result.rows[0]["observed day"],
            max_temp: result.rows[0]["max temp"],
            min_temp: result.rows[0]["min temp"],
            max_wind: result.rows[0]["max wind"],
            avg_wind: result.rows[0]["avg wind"],
            max_hourly_rainfall_period: result.rows[0]["max hourly observed rainfall period"],
            hourly_rainfall: result.rows[0]["hourly rainfall"]
          };
        }).catch(err => {
          console.log(`error fetching current conditions`);
          console.log(err);
        });
    }
    catch (err) {
      console.log(`error fetching current conditions`);
      console.log(err);
    }
  }