const express = require('express');

const router = express.Router();

/*
 API Design:
   Put all API endpoints under '/api'
 */
router.get('/api/test', (req, res) => {
    // Return them as json
    res.json('.,;:. hello world');
    console.log(`responded to /api/test route`);
});

router.get('/api/weather/current', (req, res) => {
    let conditions = fetch_current_conditions()
        .then(result => {
            console.log('f(x) current conditions', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});

router.get(['/api/weather/almanac', '/api/weather/almanac/today'], (req, res) => {
    let conditions = fetch_almanac()
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});

router.get('/api/weather/almanac/yesterday', (req, res) => {
    let conditions = fetch_almanac_yesterday()
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});

module.exports = router;