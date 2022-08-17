import pg from 'pg';

let Client = pg.Client;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
console.log("Connecting to database...", process.env.DATABASE_URL);

const client =  new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    query_timeout: 10000

});

const fetch = {
    fetch_current_conditions: () => {
        // const conditions_query = `
        // SELECT observed_at as "time", 
        // TRUNC(temperature_f::numeric,2) as "temp_f", 
        // wind_kph as "wind", wind_dir_deg as wind_dir, 
        // TRUNC(current_rain.obsered_rainfall::numeric,2) as "hourly_rain",
        // humidity 
        // FROM reports 
        // join ( 
        // select TRUNC((sum(rain_mm)/25.4)::numeric,2) as "obsered_rainfall" from
        // ( select date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where sensor_id = 1 and date_trunc('hour', observed_at) = date_trunc('hour', now() at time zone 'America/New_York' at time zone 'utc' ) ) as "hourly rainfall"
        // group by time order by time desc
        // ) as "current_rain" on 1=1
        // WHERE NOT EXISTS (
        //   SELECT * 
        //   FROM reports AS reports_temp 
        //   WHERE reports.sensor_id = reports_temp.sensor_id 
        //   AND reports.observed_at < reports_temp.observed_at) 
        // and sensor_id = '2'
        // `;

        // const conditions_query = `
        // SELECT observed_at as "time", 
        // TRUNC(temperature_f::numeric,2) as "temp_f", 
        // wind_kph as "wind", wind_dir_deg as wind_dir,
        // humidity 
        // FROM reports 
        // WHERE sensor_id = '2' 
        // ORDER BY observed_at DESC
        // LIMIT 1
        // `;

        const conditions_query = `
        SELECT observed_at as "time"        
        FROM reports  
        ORDER BY observed_at DESC
        LIMIT 1
        `;

        // perform pg query and return the results in a promise
        console.log(`fetching current conditions`);

        return client.query(conditions_query)
            .then(result => {
                return results.rows;
                
                // return conditions = {
                //     obs: result.rows[0].time,
                //     temperate_f: result.rows[0].temp_f,
                //     humidty_perc: result.rows[0].humidity,
                //     wind_dir: result.rows[0].wind_dir,
                //     wind_speed_mph: result.rows[0].wind_kph,
                //     rainfall_rate_in: result.rows[0].rain_rate
                // };
            }).then(() => {
                client.end();
            }).catch(err => {
                console.log(err);
                return err;
            })
           /* return new Promise(() => {

                client.query(conditions_query)
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
            });*/
    },
    fetch_almanac: (client) => {
        const almanac_query = `
        select count(observed_at) as "observations",
        max(date_trunc('day', observed_at)) as "observed day",
        max(TRUNC(temperature_f::numeric,2)) as "max temp",
        min(TRUNC(temperature_f::numeric,2)) as "min temp",
        max(wind_kph) as "max wind",
        TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
        COALESCE(TRUNC((AVG(max_rainfall_hour.max_ranfall_value)/25.4)::numeric,2),0) as "max hourly observed rainfall period",
        TRUNC((sum(rain_diff_mm)/25.4)::numeric,2) as "total rainfall"
        from reports
        left join (
          select date_trunc('day',hourly_rainfall.time) as "date", max(hourly_rainfall.observed_rainfall) as "max_ranfall_value" from (
            select rain_by_time.time, sum(rain_mm) as "observed_rainfall" from
        ( select created_on, observed_at, date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where rain_diff_mm > 0 ) as "rain_by_time"
        group by rain_by_time.time
        ) as "hourly_rainfall" group by date_trunc('day',hourly_rainfall.time)
          ) as "max_rainfall_hour"
          on date_trunc('day', max_rainfall_hour.date) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )
        where date_trunc('day', observed_at) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )
        group by date_trunc('day', observed_at)
        `;
        try {
            console.log(`fetching today's alamanac`);


            // Query the database for the current conditions and return them
            return client.query(almanac_query)
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
    },
    fetch_almanac_yesterday: () => {
        const almanac_yesterday = `
        select count(observed_at) as "observations",
        max(date_trunc('day', observed_at)) as "observed day",
        max(TRUNC(temperature_f::numeric,2)) as "max temp",
        min(TRUNC(temperature_f::numeric,2)) as "min temp",
        max(wind_kph) as "max wind",
        TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
        COALESCE(TRUNC((AVG(max_rainfall_hour.max_ranfall_value)/25.4)::numeric,2),0) as "max hourly observed rainfall period",
        TRUNC((sum(rain_diff_mm)/25.4)::numeric,2) as "total rainfall"
        from reports
        left join (
          select date_trunc('day',hourly_rainfall.time) as "date", max(hourly_rainfall.observed_rainfall) as "max_ranfall_value" from (
            select rain_by_time.time, sum(rain_mm) as "observed_rainfall" from
        ( select created_on, observed_at, date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where rain_diff_mm > 0 ) as "rain_by_time"
        group by rain_by_time.time
        ) as "hourly_rainfall" group by date_trunc('day',hourly_rainfall.time)
          ) as "max_rainfall_hour"
          on date_trunc('day', max_rainfall_hour.date) = date_trunc('day', (current_date - INTERVAL '1 day')::date)
        where date_trunc('day', observed_at ) = date_trunc('day', (current_date - INTERVAL '1 day')::date)
        group by date_trunc('day', observed_at )
        `;

        try {
            console.log(`fetching today's alamanac`);

            // Query the database for the current conditions and return them
            return client.query(queries.almanac_yesterday)
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
    },
    fetch_almanac_query: (date) => {
        const almanac_query = `
        select count(observed_at) as "observations",
        max(date_trunc('day', observed_at)) as "observed day",
        max(TRUNC(temperature_f::numeric,2)) as "max temp",
        min(TRUNC(temperature_f::numeric,2)) as "min temp",
        max(wind_kph) as "max wind",
        TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
        COALESCE(TRUNC((AVG(max_rainfall_hour.max_ranfall_value)/25.4)::numeric,2),0) as "max hourly observed rainfall period",
        TRUNC((sum(rain_diff_mm)/25.4)::numeric,2) as "total rainfall"
        from reports
        left join (
          select date_trunc('day',hourly_rainfall.time) as "date", max(hourly_rainfall.observed_rainfall) as "max_ranfall_value" from (
            select rain_by_time.time, sum(rain_mm) as "observed_rainfall" from
        ( select created_on, observed_at, date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where rain_diff_mm > 0 ) as "rain_by_time"
        group by rain_by_time.time
        ) as "hourly_rainfall" group by date_trunc('day',hourly_rainfall.time)
          ) as "max_rainfall_hour"
          on date_trunc('day', max_rainfall_hour.date) = date_trunc('day', (current_date - INTERVAL '1 day')::date)
        where date_trunc('day', observed_at ) = date_trunc('day', (current_date - INTERVAL '${1} day')::date)
        group by date_trunc('day', observed_at )
        `;
        try {
            console.log(`fetching today's alamanac`);

                const almanac_today = `
                select count(observed_at) as "observations",
                max(date_trunc('day', observed_at)) as "observed day",
                max(TRUNC(temperature_f::numeric,2)) as "max temp",
                min(TRUNC(temperature_f::numeric,2)) as "min temp",
                max(wind_kph) as "max wind",
                TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
                COALESCE(TRUNC((AVG(max_rainfall_hour.max_ranfall_value)/25.4)::numeric,2),0) as "max hourly observed rainfall period",
                TRUNC((sum(rain_diff_mm)/25.4)::numeric,2) as "total rainfall"
                from reports
                left join (
                  select date_trunc('day',hourly_rainfall.time) as "date", max(hourly_rainfall.observed_rainfall) as "max_ranfall_value" from (
                    select rain_by_time.time, sum(rain_mm) as "observed_rainfall" from
                ( select created_on, observed_at, date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where rain_diff_mm > 0 ) as "rain_by_time"
                group by rain_by_time.time
                ) as "hourly_rainfall" group by date_trunc('day',hourly_rainfall.time)
                  ) as "max_rainfall_hour"
                  on date_trunc('day', max_rainfall_hour.date) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )
                where date_trunc('day', observed_at) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )
                group by date_trunc('day', observed_at)
                `;
            // Query the database for the current conditions and return them
            return client.query(almanac_today)
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
}

export default fetch;