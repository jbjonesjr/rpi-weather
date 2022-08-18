-- all yesterday's reports
select date_trunc('day', observed_at::date), date_trunc('day', (now() - INTERVAL '1 day')::date), * 
from reports 
where date_trunc('day', observed_at::date) = date_trunc('day', (now() - INTERVAL '1 day')::date);



-- almanac data from all time
select count(observed_at) as "observations",
max(TO_CHAR(observed_at::date, 'yyyy-mm-dd')) "observed day",
max(TRUNC(temperature_f::numeric,2)) as "max temp",
 min(TRUNC(temperature_f::numeric,2)) as "min temp",
   max(wind_kph) as "max wind",
    TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
     max(rain_diff_mm) as "max hourly observed rainfall period",
      sum(rain_diff_mm) as "hourly rainfall"
       from reports
        group by date_trunc('hour', observed_at) order by time desc

-- almanac data where observed_at is today
select count(observed_at) as "observations",
max(TO_CHAR(observed_at::date, 'yyyy-mm-dd')) "observed day",
max(TRUNC(temperature_f::numeric,2)) as "max temp",
  min(TRUNC(temperature_f::numeric,2)) as "min temp",
    max(wind_kph) as "max wind",
      TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
      max(rain_diff_mm) as "max hourly observed rainfall period",
        sum(rain_diff_mm) as "hourly rainfall"
        from reports
          where date_trunc('day', observed_at) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )
          group by date_trunc('day', observed_at)


-- almanac today
select count(observed_at) as "observations",
max(TO_CHAR(observed_at::date, 'yyyy-mm-dd')) "observed day",
max(TRUNC(temperature_f::numeric,2)) as "max temp",
min(TRUNC(temperature_f::numeric,2)) as "min temp",
max(wind_kph) as "max wind",
TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
COALESCE(AVG(max_rainfall_hour.max_ranfall_value),0) as "max hourly observed rainfall period",
sum(rain_diff_mm) as "total rainfall"
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

-- almanac yesterday
select count(observed_at) as "observations",
max(TO_CHAR(observed_at::date, 'yyyy-mm-dd')) "observed day",
max(TRUNC(temperature_f::numeric,2)) as "max temp",
min(TRUNC(temperature_f::numeric,2)) as "min temp",
max(wind_kph) as "max wind",
TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
AVG(max_rainfall_hour.max_ranfall_value) as "max hourly observed rainfall period",
sum(reports.rain_diff_mm) as "total rainfall"
from reports
left join (
  select date_trunc('day',hourly_rainfall.time) as "date", max(hourly_rainfall.observed_rainfall) as "max_ranfall_value" from (
    select rain_by_time.time, sum(rain_mm) as "observed_rainfall" from
( select created_on, observed_at, date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where rain_diff_mm > 0 ) as "rain_by_time"
group by rain_by_time.time
) as "hourly_rainfall" group by date_trunc('day',hourly_rainfall.time)
  ) as "max_rainfall_hour"
   on date_trunc('day', max_rainfall_hour.date) = date_trunc('day', (now() - INTERVAL '1 day')::date)
where date_trunc('day', observed_at ) = date_trunc('day', (now() at time zone 'America/New_York' at time zone 'utc' - INTERVAL '1 day')::date)
group by date_trunc('day', observed_at )

-- partial almanac
select count(observed_at) as "observations",
max(TO_CHAR(observed_at::date, 'yyyy-mm-dd')) "observed day",
max(TRUNC(temperature_f::numeric,2)) as "max temp",
min(TRUNC(temperature_f::numeric,2)) as "min temp",
max(wind_kph) as "max wind",
TRUNC(avg(wind_kph)::numeric,2) as "avg wind",
max(rain_diff_mm) as "max hourly observed rainfall period",
sum(rain_diff_mm) as "total rainfall"
from reports
where date_trunc('day', observed_at) = date_trunc('day', (now() at time zone 'America/New_York' at time zone 'utc' - INTERVAL '1 day')::date at time zone 'America/New_York' at time zone 'utc' )