
module.exports = {
  current_conditions_query: `
  SELECT observed_at as "time", 
  TRUNC(temperature_f::numeric,2) as "temp_f", 
  wind_kph as "wind", wind_dir_deg as wind_dir, 
  TRUNC(current_rain.obsered_rainfall::numeric,2) as "hourly_rain",
  humidity 
  FROM reports 
  join ( 
  select TRUNC((sum(rain_mm)/25.4)::numeric,2) as "obsered_rainfall" from
  ( select date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where sensor_id = 1 and date_trunc('hour', observed_at) = date_trunc('hour', now() at time zone 'America/New_York' at time zone 'utc' ) ) as "hourly rainfall"
  group by time order by time desc
  ) as "current_rain" on 1=1
  WHERE NOT EXISTS (
    SELECT * 
    FROM reports AS reports_temp 
    WHERE reports.sensor_id = reports_temp.sensor_id 
    AND reports.observed_at < reports_temp.observed_at) 
  and sensor_id = '2'
  `,
  almanac_today: `
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
  `,
  almanac_yesterday: `
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
  `,
  almanac_query: `
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
  `
};