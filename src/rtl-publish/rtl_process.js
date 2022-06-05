const { Client } = require('pg');
const { chunksToLinesAsync, chomp } = require('@rauschma/stringio');

module.exports = {
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
    datas = {};
    datas = line.split(",");
    if (datas.length == 14 && mode == 'weather') { //Data Length varies, based on RTL-433 formats/parameters passed in
      // this is only good for weather formats (-R 166 and -R 175 are the key for me)
      // But I should probably look for new devices as well....
      result = {
        "dtg": new Date(datas[0]),
        "model": datas[3],
        "sensorId": parseInt(datas[4]),
        "seq": parseInt(datas[5]),
        "lowbattery": parseInt(datas[6]),
        "temperatureC": parseFloat(datas[7]),
        "temperatureF": (parseFloat(datas[7])*(9/5)) + 32,
        "humidity": parseInt(datas[8]),
        "wind_kph": parseFloat(datas[9]),
        "wind_dir": parseInt(datas[10]),
        "rain1": parseFloat(datas[12]),
        "rain2": parseFloat(datas[13]),
        "rain_diff": parseFloat(datas[13]) - parseFloat(datas[12])
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
      if (!this.last || (this.last.dtg.getTime() + (60 * 60 * 1000) < result.dtg.getTime())) {
        this.last = this.persist_data(result);
      } else {
        console.log(`SKIPPING: persistence last dtg: ${this.last.dtg}`);
      }
    } else {
      console.debug(`data: No parsing criteria met. mode: ${mode}, data size: ${datas.length}`);
    }
  },
  persist_data: function (data) {
    // use process.env.DATABASE_URL instead
    const client = new Client({
      connectionString: "",
      ssl: {
        rejectUnauthorized: false
      }
    });

    // client.connect();

    console.error(`SAVING: PERSISTENCE would go here`);

     client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
      console.log(res.rows);
     })
    //     let res = client.query('select * from reports where sensor_id = ${data.sensorId} and dtg = ${data.dtg};');

    // let res = client.query('select * from reports;');
    return result;
  }
}