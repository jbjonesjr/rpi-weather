import pg from 'pg';
import { chunksToLinesAsync, chomp } from '@rauschma/stringio';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

let poolInstance = null;

const getPool = () => {
  if (!poolInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return poolInstance;
};

const pool = new Proxy({}, {
  get(_target, prop, receiver) {
    const actualPool = getPool();
    const value = Reflect.get(actualPool, prop, receiver);
    return typeof value === 'function' ? value.bind(actualPool) : value;
  }
});

const toFloat = (s) => { const v = parseFloat(s); return isNaN(v) ? null : v; };
const toInt = (s) => { const v = parseInt(s, 10); return isNaN(v) ? null : v; };

// Refactor to allow injection of database client for easier testing with mocks
const rtl_process = {
  last: null,
  init: true,
  client: null, // Added to allow injection of a mock or real database client
  setClient: function(client) { // Method to inject a database client
    this.client = client;
  },
  echoReadable: async function (readable, mode) {
    for await (const line of chunksToLinesAsync(readable)) {    
      console.log('RAW DATA: ' + chomp(line))
      if(this.detect_headers(line)) continue;
      this.process_input(line, mode);
    }
  },
  detect_headers: function(line, mode = 'weather') {
    let orig_init = this.init;
    // the system prints out the headers in a line inititally that we want to ignore.
    if(line.startsWith("time,") && mode == 'weather') {
      this.init = false;
      return orig_init;
  }
  },
  process_input: function (line, mode = 'weather') {
    let datas = {};
    datas = line.split(",");
    if(datas[3].includes("LaCrosse") && datas.length == 20 ) { //Data Length varies, based on RTL-433 formats/parameters passed in
      // this is only good for weather formats (-R 166 and -R 175 are the key for me)
      // But I should probably look for new devices as well....
      // Lacrosse format
      // time, msg, codes, model, id, seq, flags, temp_c, humidity, wind_avg_kmh, wind_dir, mic, battery_ok, startup, rain_mm, rain_mm2
      // mic is message integrity code

      // TODO: Actually do something with the battery_ok flag

      const tempC = toFloat(datas[7]);
      let result = {
        "dtg": new Date(datas[0]),
        "model": datas[3],
        "sensorId": toInt(datas[4]),
        "seq": toInt(datas[5]),
        "lowbattery": toInt(datas[6]),
        "battery_ok": toInt(datas[12]),
        "mic": datas[11],  
        "startup": toInt(datas[13]),
        "temperatureC": tempC,
        "temperatureF": tempC !== null ? (tempC * (9/5)) + 32 : null,
        "humidity": toInt(datas[8]),
        "wind_kph": toFloat(datas[9]),
        "wind_dir": toInt(datas[10]),
        "rain1_mm": toFloat(datas[14]),
        "rain2_mm": toFloat(datas[15]),
        "rain_diff_mm": (toFloat(datas[14]) ?? 0.0) - (toFloat(datas[15]) ?? 0.0),
        "rain_diff_in": ((toFloat(datas[14]) ?? 0.0) - (toFloat(datas[15]) ?? 0.0)) / 25.4
      };

      console.debug('data:', result);
      /*
   The Breezepro sensor generates a packet every 'n' seconds but only transmits if one or
   more of the following conditions are satisfied:
   - temp changes +/- 0.8 degrees C
   - humidity changes +/- 1%
   - wind speed changes +/- 0.5 kM/h
   Thus, if there is a gap in sequencing, it is due to bad packet[s] (too short,
   failed CRC) or packet[s] that didn't satisfy at least one of these three
   conditions. 'n' above varies with temperature.  At 0C and above, 'n' is 31.
   Between -17C and 0C, 'n' is 60.  Below -17C, 'n' is 360.
   */
      // ensure we haven't saved a result in the last hour
      // why would i want to skip raw reports?
      //if (this.last == null || (this.last.dtg.getTime() + (60 * 60 * 1000) < result.dtg.getTime())) {
        this.last = this.persist_data(result);
      //} else {
        //console.log(`SKIPPING: persistence last dtg: ${this.last.dtg}`);
      //}
    } else if(datas[3].includes("Fineoffset") && datas.length == 20 ) { 
       /*
      WH51 fineoffset format
        
        time,msg,codes,model name,id,seq,flags,temperature_C,humidity,wind_avg_km_h,wind_dir_deg,mic,battery_ok,startup,rain_mm,rain2_mm,battery_mV,moisture,boost,ad_raw
        dtg,,,model name,id,,,,,,,mic,battery_ok,,,,battery_mV,moisture,boost,ad_raw
        2024-05-27 22:07:40,,,Fineoffset-WH51,0dd07d,,,,,,,CRC,0.889,,,,1500,30,0,186
        */
      let result = {
        "dtg": new Date(datas[0]), // this is the time
        "model": datas[3], // this is the sensor name
        "sensorId": datas[4], // this is the sensor id
        "battery_ok": toFloat(datas[12]), // 0 = low, 1 = ok
        "moisture": toInt(datas[17]),
        "battery_mV": toInt(datas[16]), 
        "boost": toInt(datas[18]), // 0 = off, 1 = on
        "ad_raw": toInt(datas[19])
      };
      console.debug('data:', result);
      this.last = this.persist_data(result);
    }
  else{
      console.debug(`data: No parsing criteria met. mode: ${mode}, data size: ${datas.length}`);
    }
  },
  persist_data: async function (data) {
    const db = this.client || pool;
    try {
      console.log(`connected to database, parsing sensor ${data.model} (${data.sensorId})`);
      // get sensor record using parameterized query to prevent SQL injection
      const sensor_res = await db.query(
        'SELECT * FROM sensors WHERE sensor_id = $1 AND sensor_name = $2',
        [String(data.sensorId), data.model]
      );

      let sensor_details;
      if (sensor_res.rowCount == 0) {
        console.log(`No sensor found for sensor id ${data.sensorId}`);
        console.log(`Inserting sensor ${data.model} (${data.sensorId})`);
        const insert_res = await db.query(
          'INSERT INTO sensors (created_on, sensor_id, sensor_type, data_validity, sensor_name) VALUES (to_timestamp($1 / 1000), $2, $3, $4, $5) RETURNING *',
          [Date.now(), String(data.sensorId), 'weather', 1, data.model]
        );
        sensor_details = insert_res.rows[0];
      } else {
        console.log(`Found sensor ${data.model} (${data.sensorId}). pid: ${sensor_res.rows[0].pid}`);
        sensor_details = sensor_res.rows[0];
      }

      if (sensor_details.data_validity == 1) {
        if (sensor_details.sensor_type == "weather") {
          await db.query(
            'INSERT INTO reports (created_on, observed_at, seq, sensor_id, lowbattery, battery_ok, mic, startup, temperature_f, humidity, wind_kph, wind_dir_deg, rain_first_mm, rain_second_mm, rain_diff_mm) VALUES (to_timestamp($1 / 1000), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
            [Date.now(), data.dtg, data.seq, sensor_details.pid, data.lowbattery, data.battery_ok, data.mic, data.startup, data.temperatureF, data.humidity, data.wind_kph, data.wind_dir, data.rain1_mm, data.rain2_mm, data.rain_diff_mm]
          );
        } else if (sensor_details.sensor_type == "moisture") {
          await db.query(
            'INSERT INTO moisture_report (created_on, observed_at, sensor_id, battery_ok, moisture, battery_mv, boost, ad_raw) VALUES (to_timestamp($1 / 1000), $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [Date.now(), data.dtg, sensor_details.pid, data.battery_ok, data.moisture, data.battery_mV, data.boost, data.ad_raw]
          );
        } else {
          console.log(`sensor ${data.model} (${data.sensorId}) is invalid type (${sensor_details.sensor_type}), skipping insert`);
          return;
        }
      } else {
        console.log(`sensor ${data.model} (${data.sensorId}) is marked invalid, skipping insert`);
        return;
      }
      console.log('inserted data');
    } catch(err) {
      console.error('Failed to persist data:', err);
    }
  }
}

export default rtl_process;
