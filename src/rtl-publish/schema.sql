DROP TABLE reports;

CREATE TABLE reports
(
    pid serial NOT NULL,
    -- autoincrement
    created_on timestamp without time zone NOT NULL,
    observed_at timestamp without time zone NOT NULL,
    seq integer NOT NULL,
    sensor_id integer NOT NULL,
    lowbattery integer NULL,
    battery_ok integer NULL,
    mic character varying(7) NULL,
    startup integer NULL,
    temperature_f double precision NULL,
    humidity double precision NULL,
    wind_kph double precision NULL,
    wind_dir_deg double precision NULL,
    rain_first_mm double precision NULL,
    rain_second_mm double precision NULL,
    rain_diff_mm double precision NULL,
    rain_rate double precision NULL,
    pressure_mb double precision NULL
);

DROP TABLE test_reports;

CREATE TABLE test_reports
(
    pid serial NOT NULL,
    -- autoincrement
    created_on timestamp without time zone NOT NULL,
    observed_at timestamp without time zone NOT NULL,
    seq integer NOT NULL,
    sensor_id integer NOT NULL,
    lowbattery integer NULL,
    battery_ok integer NULL,
    mic character varying(7) NULL,
    startup integer NULL,
    temperature_f double precision NULL,
    humidity double precision NULL,
    wind_kph double precision NULL,
    wind_dir_deg double precision NULL,
    rain_first_mm double precision NULL,
    rain_second_mm double precision NULL,
    rain_diff_mm double precision NULL,
    rain_rate double precision NULL,
    pressure_mb double precision NULL
);

DROP TABLE hourly_reports;

CREATE TABLE hourly_reports
(
    pid serial NOT NULL,
    created_on timestamp without time zone NOT NULL,
    valid_date date NOT NULL,
    valid_hour_utc integer NOT NULL,
    max_temperature_f double precision NULL,
    min_temperature_f double precision NULL,
    avg_humidity double precision NULL,
    wind_kph double precision NULL,
    max_wind_kph double precision NULL,
    max_wind_kph_dir_deg double precision NULL,
    avg_wind_kph double precision NULL,
    avg_wind_kph_dir_deg double precision NULL,
    total_precip_mm double precision NULL,
    max_rain_rate_5 double precision NULL,
    max_rain_rate_15 double precision NULL,
    max_rain_rate_30 double precision NULL,
    max_pressure_mb double precision NULL
    min_pressure_mb double precision NULL
);

DROP TABLE sensors;

CREATE TABLE sensors
(
    pid serial,
    created_on timestamp without time zone NOT NULL,
    sensor_id character varying(7) NOT NULL,
    sensor_type character varying(20) NOT NULL, -- weather or moisture
    data_validity integer NOT NULL,
    wx_conditions boolean NOT NULL,
    precipitation boolean NOT NULL,
    sensor_name character varying(20) NOT NULL
);


DROP TABLE moisture_report;
create table moisture_report
(
    pid serial,
    created_on timestamp without time zone NOT NULL,
    observed_at timestamp without time zone NOT NULL,
    sensor_id integer NOT NULL,
    battery_ok numeric NULL,
    moisture integer NULL,
    battery_mV integer NULL,
    boost integer NULL,
    ad_raw integer NULL
);