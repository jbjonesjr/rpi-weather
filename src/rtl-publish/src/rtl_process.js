import pg from 'pg';
import { chunksToLinesAsync, chomp } from '@rauschma/stringio';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config();


const rtl_process = {
  last: null,
  init: true,
  echoReadable: async function (readable) {
    for await (const line of chunksToLinesAsync(readable)) {    
      console.log('RAW DATA: ' + chomp(line))
      if(this.detect_headers(line)) continue;
      this.process_input(line);
    }
  },
  detect_headers: function(line, mode = 'weather') {
    let orig_init = this.init;
    if (this.init) {
      // the system prints out the headers in a line inititally that we want to ignore.
      // TODO: actually detect this line instead of "assuming". Build a function that matches the input and returns true
      this.init = false;
      return orig_init;
    }
  },
  process_input: function (line, mode = 'weather') {
    let datas = {};
    datas = line.split(",");
    if (datas.length == 16 && mode == 'weather') { //Data Length varies, based on RTL-433 formats/parameters passed in
      // this is only good for weather formats (-R 166 and -R 175 are the key for me)
      // But I should probably look for new devices as well....
      // time, msg, codes, model, id, seq, flags, temp_c, humidity, wind_avg_kmh, wind_dir, mic, battery_ok, startup, rain_mm, rain_mm2
      // mic is message integrity code

      let result = {
        "dtg": new Date(datas[0]),
        "model": datas[3],
        "sensorId": parseInt(datas[4]),
        "seq": parseInt(datas[5]),
        "lowbattery": parseInt(datas[6]) || null,
        "battery_ok": parseInt(datas[12]) || null,
        "mic": datas[11],  
        "startup": parseInt(datas[13]) || null,
        "temperatureC": parseFloat(datas[7]) || null,
        "temperatureF": (parseFloat(datas[7])*(9/5)) + 32 || null,
        "humidity": parseInt(datas[8]) || null,
        "wind_kph": parseFloat(datas[9]) || null,
        "wind_dir": parseInt(datas[10]) || null,
        "rain1_mm": parseFloat(datas[14]) || null,
        "rain2_mm": parseFloat(datas[15]) || null,
        "rain_diff_mm": (parseFloat(datas[14]) || 0.0 ) - (parseFloat(datas[15]) || 0.0),
        "rain_diff_in": ((parseFloat(datas[14]) || 0.0 ) - (parseFloat(datas[15]) || 0.0))/25.4
      };
      console.debug('data:', result);
      /*
   The sensor generates a packet every 'n' seconds but only transmits if one or
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
    } else {
      console.debug(`data: No parsing criteria met. mode: ${mode}, data size: ${datas.length}`);
    }
  },
  persist_data: function (data) {
    //connect to a heroku pgsql database using an env variable
    process.env.NODE_TLS_REJECT_UNAUTHORIZED=0
      console.log("Connecting to database...",process.env.DATABASE_URL);
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
    try{
      // pg insert with promises
      client.connect()
      .then(() => {
        console.log(`connected to database, parsing sensor ${data.model} (${data.sensorId})`);
        //get sensor id from database for the sensor id in the data

        return client.query(`SELECT * FROM sensors WHERE sensor_id = ${data.sensorId}::character varying and sensor_type = '${data.model}'`);
      })
      .then((sensor_res) => {
        if(sensor_res.rowCount == 0 ){
          console.log(`No sensor found for sensor id ${data.sensorId}`);
          console.log(`Inserting sensor ${data.model} (${data.sensorId})`);
          return client.query(`INSERT INTO sensors (created_on, sensor_id, sensor_type, data_validity) VALUES (to_timestamp(${Date.now()} / 1000), '${data.sensorId}', '${data.model}', 1) RETURNING *`);
        }else{
          console.log(`Found sensor ${data.model} (${data.sensorId}). pid: ${sensor_res.rows[0].pid}`);
          return sensor_res;
        }
      })
      .then((sensor_res) => {
        return sensor_res.rows[0];
      })
      .then((sensor_details) => {
        //console.debug("sensor details: ",sensor_details);
        if(sensor_details.data_validity == 1){       
          return client.query(`INSERT INTO reports (created_on, observed_at, seq, sensor_id, lowbattery, battery_ok, mic, startup, temperature_f, humidity, wind_kph, wind_dir_deg, rain_first_mm, rain_second_mm, rain_diff_mm) VALUES (to_timestamp(${Date.now()} / 1000), $1, $2, ${sensor_details.pid}, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`, [data.dtg, data.seq, data.lowbattery, data.battery_ok, data.mic, data.startup, data.temperatureF, data.humidity, data.wind_kph, data.wind_dir, data.rain1_mm, data.rain2_mm, data.rain_diff_mm]);
        }else{
          return Promise.reject(`sensor ${data.model} (${data.sensorId}) is marked invalid, skipping insert`);
        }
      }).then((res) => {
        console.log('inserted data');
        client.end();
      }
      ).catch(err => {
        console.log(err);
        client.end();
      }
      );
    }
    catch(err){
      console.log(err);
    }
    
    
    //     let res = client.query('select * from reports where sensor_id = ${data.sensorId} and dtg = ${data.dtg};');

    // let res = client.query('select * from reports;');
    return result;
  }
}

export default rtl_process;