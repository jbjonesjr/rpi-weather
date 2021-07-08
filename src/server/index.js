const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Put all API endpoints under '/api'
app.get('/api/test', (req, res) => {
  // Return them as json
  res.json('hello world');

  console.log(`responded to /api/test route`);
});

let fetch_current_conditions = ()=>{
    return conditions = {
        temperate_f: 00,
        humidty_perc: 00,
        wind_dir: 00,
        wind_speed_mph: 00,
        rainfall_rate_in: 00
    };
}
app.get('/api/weather/current', (req, res) => {
  let conditions = fetch_current_conditions()
    res.json(conditions);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/../app/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Weather RPI express server listening on ${port}`);