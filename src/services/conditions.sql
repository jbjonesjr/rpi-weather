-- current conditions
SELECT (observed_at at time zone 'America/New_York') as "time", 
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