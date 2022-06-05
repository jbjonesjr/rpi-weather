CREATE TABLE reports
(
    pid serial NOT NULL,
    -- autoincrement
    created_on timestamp without time zone NOT NULL,
    observed_at timestamp without time zone NOT NULL,
    sensor_id character integer NOT NULL,
    temperature_f double precision NULL,
    humidity double precision NULL,
    wind_kph double precision NULL,
    wind_dir character NULL,
    wind_dir_deg double precision NULL,
    rain_first integer NULL,
    rain_second integer NULL,
    rain_diff double precision NULL,
    rain_rate double precision NULL,
    pressure_mb double precision NULL,
    pressure_in double precision NULL
);

CREATE TABLE sensors
(
    pid serial NOT NULL,
    created_on timestamp without time zone NOT NULL,
    sensor_id character varying(7) NOT NULL,
    sensor_type character varying(20) NOT NULL
);