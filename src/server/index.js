const express = require('express');
const path = require('path');
const { Client } = require('pg');
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
  let conditions = fetch_current_conditions().then(result => { console.log(result); res.json(result); }).catch(err => { console.log(err); res.json(err); });
  console.log('f(x) return', conditions);
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
    const current_conditions_query = <sql>
      SELECT observed_at as "time",
      TRUNC(temperature_f::numeric,2) as "temp_f",
      wind_kph as "wind", wind_dir_deg as wind_dir,
      rain_diff_mm as "rain",
      humidity
      FROM reports
      WHERE NOT EXISTS (
      SELECT *
      FROM reports AS reports_temp
      WHERE reports.sensor_id = reports_temp.sensor_id
      AND reports.observed_at < reports_temp.observed_at)
      and sensor_id = '2';
    </sql>

    return client.query(current_conditions_query)
      .then(result => {
        console.log(`fetched current conditions`);

        return conditions = {
          obs: result.rows[0].oberved_at,
          temperate_f: result.rows[0].temp_f,
          humidty_perc: result.rows[0].humidity,
          wind_dir: result.rows[0].wind_dir,
          wind_speed_mph: result.rows[0].wind_kph,
          rainfall_rate_in: result.rows[0].rain_rate
        };
        // return result.rows[0];
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