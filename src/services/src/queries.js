const current_conditions_query = `
SELECT observed_at as "time", 
TRUNC(temperature_f::numeric,2) as "temp_f", 
wind_kph as "wind", wind_dir_deg as wind_dir, 
current_rain.obsered_rainfall as "hourly_rain",
humidity 
FROM reports 
join ( 
select sum(rain_mm) as "obsered_rainfall" from
( select date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where sensor_id = 1 and date_trunc('hour', observed_at) = date_trunc('hour', now() at time zone 'America/New_York' at time zone 'utc' ) ) as "hourly rainfall"
group by time order by time desc
) as "current_rain" on 1=1
WHERE NOT EXISTS (
  SELECT * 
  FROM reports AS reports_temp 
  WHERE reports.sensor_id = reports_temp.sensor_id 
  AND reports.observed_at < reports_temp.observed_at) 
and sensor_id = '2'
`;

const almanac_query = `
select count(observed_at) as "observations",
max(date_trunc('day', observed_at)) as "observed day",
max(TRUNC(temperature_f::numeric,2)) as "max temp",
min(TRUNC(temperature_f::numeric,2)) as "min temp",
max(wind_kph) as "max wind",
TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
max(rain_diff_mm) as "max hourly observed rainfall period",
sum(rain_diff_mm) as "hourly rainfall"
from reports
where date_trunc('day', observed_at) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )
group by date_trunc('day', observed_at)
`;