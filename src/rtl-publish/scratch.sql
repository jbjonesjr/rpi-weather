select * from reports;

select * from reports_archive;

truncate table reports_archive;

select * from sensors;

update sensors set data_validity = 0 where pid = 3;

-- all rainfall
select created_on, observed_at, 
date_trunc('hour', observed_at ) as "time", 
rain_diff_mm as "rain_mm" 
from reports 
where rain_diff_mm > 0 

-- rainfall by hour
select time, sum(rain_mm) as "obsered rainfall" from
( select created_on, observed_at, date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where rain_diff_mm > 0 ) as "rain_by_time"
group by time order by time desc;

-- rainfall this hour
select time, sum(rain_mm) as "obsered rainfall" from
( select date_trunc('hour', observed_at) as "time", rain_diff_mm as "rain_mm" from reports where sensor_id = 1 and date_trunc('hour', observed_at) = date_trunc('hour', now() at time zone 'America/New_York' at time zone 'utc' ) ) as "hourly rainfall"
group by time order by time desc;

SELECT created_on, observed_at, * from reports order by observed_at desc LIMIT 1

SELECT *
FROM reports
WHERE NOT EXISTS (
  SELECT *
  FROM reports AS reports_temp
  WHERE reports.sensor_id = reports_temp.sensor_id AND reports.observed_at < reports_temp.observed_at
)
and sensor_id = '2';

SELECT * 
from reports 
where date_trunc('day', observed_at) = date_trunc('day', now() at time zone 'America/New_York' at time zone 'utc' )


-- date work
select date_trunc('day', observed_at), * from reports where date_trunc('day', observed_at::date) = date_trunc('day', (current_date - INTERVAL '0 day')::date at time zone 'America/New_York' at time zone 'utc' );
select date_trunc('day', observed_at), * from reports where date_trunc('day', observed_at) = date_trunc('day', (current_date) at time zone 'America/New_York' at time zone 'utc' );
SELECT observed_at, date_trunc('day', observed_at::date at time zone 'America/New_York' at time zone 'utc' ), current_date, now(), now() at time zone 'America/New_York' at time zone 'utc' as "now in US EAST", (current_date - INTERVAL '0 day')::date as "currdate-0", (current_date - INTERVAL '1 day')::date as "currdate-1" from reports order by observed_at desc LIMIT 1 ;
select now(),now() at time zone 'America/New_York' at time zone 'utc' , * from reports order by observed_at desc
select now() at time zone 'utc' at time zone 'utc';
select date_trunc('day', (current_date at time zone 'America/New_York' at time zone 'utc' - INTERVAL '0 day')::date);