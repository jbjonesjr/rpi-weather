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

DROP TABLE sensors;

CREATE TABLE sensors
(
    pid serial,
    created_on timestamp without time zone NOT NULL,
    sensor_id character varying(7) NOT NULL,
    sensor_type character varying(20) NOT NULL,
    data_validity integer NOT NULL
);