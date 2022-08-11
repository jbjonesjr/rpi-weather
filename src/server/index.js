const express = require('express');
const path = require('path');
const { Client } = require('pg');
const queries = require('../services/src/queries.js');
//let rtl_process = require("../../src/rtl-publish/rtl_process.js");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
console.log("Connecting to database...", process.env.DATABASE_URL);
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
client.connect();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

/*
 API Design:
   Put all API endpoints under '/api'
 */

// Validate the system is running
app.get('/api/test', (req, res) => {
  // Return them as json
  res.json('.,;:. hello world');
  console.log(`responded to /api/test route`);
});

app.get('/api/weather/current', (req, res) => {
  let conditions = fetch_current_conditions()
    .then(result => {
      console.log('f(x) current conditions', result);
      res.json(result);
    })
    .catch(err => {
      console.log(err); res.json(err);
    });
});

app.get('/api/weather/almanac', (req, res) => {
  let conditions = fetch_almanac()
    .then(result => {
      console.log('f(x) alamanac data', result);
      res.json(result);
    })
    .catch(err => {
      console.log(err); res.json(err);
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back the basic table of contents file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

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
    return client.query(queries.almanac_today)
      
      .then(result => {
        console.log(`fetched daily almanac`);

        return almanac = {
          obs: result.rows[0]["observed day"],
          max_temp: result.rows[0]["max temp"],
          min_temp: result.rows[0]["min temp"],
          max_wind: result.rows[0]["max wind"],
          avg_wind: result.rows[0]["avg wind"],
          max_hourly_rainfall_period: result.rows[0]["max hourly observed rainfall period"],
          hourly_rainfall: result.rows[0]["total rainfall"]
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

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Weather RPI express server listening on ${port}`);