import express from 'express';
import fetchService from '../../services/src/fetchService.js';

let router = express.Router();

/* Notes:
https://www.codegrepper.com/code-examples/javascript/import+%7B+Router+%7D+from+%27express%27%3B+const+router+%3D+express.Router%28%29%3B

*/

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
    fetchService.fetch_current_conditions()
        .then(result => {
            console.log('f(x) current conditions', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); 
            res.json(err);
        });  
});

router.get('/api/weather/almanac/yesterday', (req, res) => {
    let conditions = fetchService.fetch_almanac_yesterday()
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});
// router.get(['/api/weather/almanac', '/api/weather/almanac/today'], (req, res) => {
router.get(['/api/weather/almanac/today'], (req, res) => {
    let conditions = fetchService.fetch_almanac()
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});

router.get(['/api/weather/almanac/:year/:month/:day'], (req, res) => {
    let conditions = fetchService.fetch_almanac_query(req.params.year, req.params.month, req.params.day)
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});

export default router;