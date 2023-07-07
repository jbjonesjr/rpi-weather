import express from 'express';
import fetchService from '../../services/src/fetchService.js';
import path from 'path';

let router = express.Router();
let __dirname = path.resolve();


/* Notes:
https://www.codegrepper.com/code-examples/javascript/import+%7B+Router+%7D+from+%27express%27%3B+const+router+%3D+express.Router%28%29%3B

*/

router.use(express.static(path.join(__dirname, '../app/build')));
router.use('/app/static', express.static(path.join(__dirname, '../app/build/static')));

router.get(['/app', '/app/', '/app/index.html','/app/bear'], (req, res) => {
    res.sendFile('index.html', {root: '../app/build/'});
    console.log(`responded to /app route`);
});

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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set('Content-Type', 'application/json');

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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set('Content-Type', 'application/json');

    fetchService.fetch_almanac_yesterday()
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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set('Content-Type', 'application/json');
    
    fetchService.fetch_almanac()
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});

router.get(['/api/weather/almanac/:year/:month/:day'], (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set('Content-Type', 'application/json');

    fetchService.fetch_almanac_query(req.params.year, req.params.month, req.params.day)
        .then(result => {
            console.log('f(x) alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});


router.get(['/api/weather/almanac/extremes/:year/:month/:day'], (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set('Content-Type', 'application/json');

    fetchService.fetch_temperature_extremes(req.params.year, req.params.month, req.params.day)
        .then(result => {
            console.log('f(x) temperature extreme alamanac data', result);
            res.json(result);
        })
        .catch(err => {
            console.log(err); res.json(err);
        });
});


export default router;