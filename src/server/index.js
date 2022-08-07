const express = require('express');
const path = require('path');
//let rtl_process = require("../../src/rtl-publish/rtl_process.js");


// use process.env.DATABASE_URL instead
// const client = new Client({
//   connectionString: "postgresql-defined-56618",
//   ssl: {
//     rejectUnauthorized: false
//   }
// });




const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

/*
 API Design:
   Put all API endpoints under '/api'
 */

// Validate the system is running
app.get('/api/test', (req, res) => {
  // Return them as json
  res.json('hello world');

  console.log(`responded to /api/test route`);
});

app.get('/api/weather/current', (req, res) => {
  let conditions = fetch_current_conditions()
    res.json(conditions);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/../app/build/index.html'));
});

let fetch_current_conditions = ()=>{
  client.connect();

  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
    return conditions = {
        temperate_f: 00,
        humidty_perc: 00,
        wind_dir: 00,
        wind_speed_mph: 00,
        rainfall_rate_in: 00
    };
}

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Weather RPI express server listening on ${port}`);