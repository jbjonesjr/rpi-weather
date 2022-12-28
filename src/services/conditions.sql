-- current conditions
SELECT (observed_at at time zone 'America/New_York') as "time", 
TRUNC(temperature_f::numeric,2) as "temp_f", 
wind_kph as "wind", wind_dir_deg as wind_dir, 
COALESCE(current_rain.obsered_rainfall,0) as "hourly_rain",
humidity,
(0.0817*(3.71* ((COALESCE(wind_kph,0.25))^0.5) + 5.81 - (0.25* ((COALESCE(wind_kph,0.25))^0.5)))*((TRUNC(temperature_f::numeric,2)) - 91.4) + 91.4) as "wind_chill_new"
FROM reports 
left join ( 
select "time", TRUNC((sum(rain_mm)/25.4)::numeric,2) as "obsered_rainfall" from
( select date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where sensor_id = 1 and date_trunc('hour', observed_at) = date_trunc('hour', now() at time zone 'America/New_York' at time zone 'utc' ) ) as "hourly rainfall"
group by time order by time desc
) as "current_rain" on 1=1
WHERE NOT EXISTS (
  SELECT * 
  FROM reports AS reports_temp 
  WHERE reports.sensor_id = reports_temp.sensor_id 
  AND reports.observed_at < reports_temp.observed_at) 
and sensor_id = '2'

# sql windchill equation
# http://weather.uky.edu/aen599/wchart.htm

#select temp, wind_mph, (0.0817*(3.71* (wind_mph^0.5) + 5.81 - (0.25* wind_mph))*(temp - 91.4) + 91.4) as "wind_chill" from (select 34 as temp, 3 as wind_mph) as "test"