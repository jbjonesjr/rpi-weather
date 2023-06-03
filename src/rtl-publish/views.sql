-- test data
select * from vw_daily_almanac;
select * from vw_daily_almanac where "observed_day_dt" >= date_trunc('day', (now() at time zone 'America/New_York' at time zone 'utc' - INTERVAL '14 day')::date);
select * from vw_daily_almanac where "observed_day_dt" = date_trunc('day', (now() at time zone 'America/New_York' at time zone 'utc')::date);
select * from vw_daily_almanac where "observed_day_dt" = date_trunc('day', (now() at time zone 'America/New_York' at time zone 'utc' - INTERVAL '5 day')::date);

CREATE FUNCTION daily_almanac(date_count integer)
RETURNS table AS $$
BEGIN
  RETURN select * from vw_daily_almanac where "observed_day_dt" = date_trunc('day', (now() at time zone 'America/New_York' at time zone 'utc' - INTERVAL '`date_count` day')::date);
END;
$$ LANGUAGE plpgsql;


drop view vw_daily_almanac;

create or replace view vw_daily_almanac as
select  sum(observations) as "observations",
        max(TO_CHAR(observed_day_dtg, 'yyyy-mm-dd')) "observed_day_str",
        max(observed_day_dtg::date) as "observed_day_dt",
        max(temp_max_f) as "max temp",
        min(temp_min_f) as "min temp",
        max(wind_max_kph) as "max wind",
        ROUND(avg(wind_avg_kph)::numeric,2) as "avg wind",
        MAX(hourly_rainfall_in) as "max hourly observed rainfall period",
        sum(hourly_rainfall_in) as "total rainfall"
        from vw_almanac_hourly 
        group by date_trunc('day', observed_day_dtg )
 
-- almanac hourly
drop view vw_almanac_hourly;

create or replace view vw_almanac_hourly as 
select vw_almanac_reports_hourly.*, 
vw_almanac_rainfall_hourly.hourly_rainfall_mm, 
vw_almanac_rainfall_hourly.hourly_rainfall_in 
from vw_almanac_reports_hourly
    left join vw_almanac_rainfall_hourly
    on vw_almanac_reports_hourly.observation_str = vw_almanac_rainfall_hourly.observation_str
    order by vw_almanac_reports_hourly.observation_str desc;

select * from vw_almanac_hourly order by observation_str desc limit 100;

-- Almanac rainfall hourly
drop view vw_almanac_rainfall_hourly;
create or replace view vw_almanac_rainfall_hourly as
SELECT date_trunc('hour', rain_by_time.time) AS "observation_dtg",
       TO_CHAR(rain_by_time.time, 'yyyy-mm-dd HH24:00') AS "observation_str", 
       SUM(rain_mm) AS "hourly_rainfall_mm",
       ROUND((SUM(rain_mm)/25.4)::numeric, 2) AS "hourly_rainfall_in"
FROM (
  SELECT created_on, 
         observed_at, 
         date_trunc('hour', observed_at) AS "time", 
         rain_diff_mm AS "rain_mm" 
  FROM reports 
  WHERE rain_diff_mm > 0 
) AS "rain_by_time"
GROUP BY rain_by_time.time;

select * from vw_almanac_rainfall_hourly;


--  almanac rainfall daily
drop view vw_alamanc_rainfall_daily;
create or replace view vw_alamanc_rainfall_daily as
select 
    date_trunc('day',hourly_rainfall.observation_dtg) as "observation_dtg",
    max(TO_CHAR(hourly_rainfall.observation_dtg, 'yyyy-mm-dd')) "observation_str", 
    TRUNC(max(hourly_rainfall.hourly_rainfall_mm)::numeric,2) as "max_hourly_rainfall_mm",
    TRUNC(max(hourly_rainfall.hourly_rainfall_in)::numeric,2) as "max_hourly_rainfall_in",
    COUNT(hourly_rainfall.observation_dtg) as "num_hourly_reports"
    from vw_hourly_almanac_rainfall as "hourly_rainfall" 
    group by date_trunc('day', hourly_rainfall.observation_dtg);

select * from vw_alamanc_rainfall_daily;


-- Almanac reports hourly
drop view vw_almanac_reports_hourly;
create or replace view vw_almanac_reports_hourly as
select count(observed_at) as "observations",
        max(TO_CHAR(observed_at, 'yyyy-mm-dd HH24:00')) "observation_str",
        max(observed_at) as "observed_day_dtg",
        max(TRUNC(temperature_f::numeric,2)) as "temp_max_f",
        min(TRUNC(temperature_f::numeric,2)) as "temp_min_f",
        max(wind_kph) as "wind_max_kph",
        TRUNC(avg(wind_kph)::numeric,2) as "wind_avg_kph"
        from reports
        group by date_trunc('hour', observed_at );

select * from vw_almanac_reports_hourly order by observation_str desc limit 20;


-- alamanac reports daily
drop view vw_almanac_reports_daily;
create or replace view vw_almanac_reports_daily as
select sum(observations) as "observations",
        max(TO_CHAR(observed_day_dtg::date, 'yyyy-mm-dd')) "observed_day_str",
        max(observed_day_dtg::date) as "observed_day_dt",
        max(TRUNC(temp_max_f::numeric,2)) as "max temp",
        min(TRUNC(temp_min_f::numeric,2)) as "min temp",
        max(wind_max_kph) as "max wind",
        TRUNC(avg(wind_avg_kph)::numeric,2) as "avg wind"
        from vw_hourly_almanac_reports
        group by date_trunc('day', observed_day_dtg) ;

select * from vw_almanac_reports_daily;
