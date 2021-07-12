const { Client } = require('pg');
//docs: https://www.npmjs.com/package/postgres

let spawn = require('child_process').spawn;
const { chunksToLinesAsync, chomp } = require('@rauschma/stringio');
let init = true;
let last = null;

const mode = 'weather';
const weatherModels = ["-R", "166", "-R", "175"];
const allModels = [];

var options = {
  stdio: ["ignore", "pipe", process.stderr]
};
if (mode == 'weather') {
  var child = spawn("rtl_433", ["-f", "915M", "-F", "csv"].concat(weatherModels), options);
} else {
  var child = spawn("rtl_433", ["-f", "915M", "-F", "csv"].concat(allModels), options);
}

echoReadable(child.stdout);

/*

inspired by https://github.com/Ax-LED/pimatic-rtl433/blob/master/rtl433.coffee
for reference: https://github.com/merbanan/rtl_433
used code/strategy from: https://stackoverflow.com/a/65475259/464990

*/

async function echoReadable(readable) {
  for await (const line of chunksToLinesAsync(readable)) {    
    console.log('RAW INGEST: ' + chomp(line))
    if(init){
      init = false;
      continue;
    }
      
    datas = {};
    datas = line.split(",")
    if (datas.length == 14 && mode == 'weather') { //Data Length varies, based on RTL-433 formats/parameters passed in
      // this is only good for weather formats (-R 166 and -R 175 are the key for me)
      // But I should probably look for new devices as well....
      result = {
        "dtg": new Date(datas[0]), //YYYY-MM-DD HH24:MI:SS
        "model": datas[3],
        "sensorId": datas[4],
        "seq": datas[5],
        "lowbattery": datas[6],
        "temperatureC": parseFloat(datas[7]),
        "humidity": parseInt(datas[8]),
        "wind_kph": parseFloat(datas[9]),
        "wind_dir": parseInt(datas[10]),
        "rain1": parseFloat(datas[12]),
        "rain2": parseFloat(datas[13])
      }
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

      if (!last || (last.dtg.getTime() + (60 * 60 * 1000) < result.dtg.getTime())) {
        console.log(`SAVING: PERSISTENCE goes here`)
        if(last)
          console.debug(`last dtg: ${last.dtg}`)
        last = result;
      } else {
        console.log(`SKIPPING: persistence last dtg: ${last.dtg}`)
      }
    } else {
      console.debug(`data: No parsing criteria met. mode: ${mode}, data size: ${datas.length}`)
    }



  }
}



// use process.env.DATABASE_URL instead
const client = new Client({
  connectionString: "postgres://lovtaqracvoeyl:c11f64483882db502aa521cea87e2383af294b06e68ca161eef66aa7850f2db1@ec2-54-152-185-191.compute-1.amazonaws.com:5432/d3fit8gdg1cd51",
  ssl: {
    rejectUnauthorized: false
  }
});


/*
const users = [{
  name: 'Murray',
  age: 68,
  garbage: 'ignore'
}, {
  name: 'Walter',
  age: 78
}]

sql`
  insert into users ${
    sql(users, 'name', 'age')
  }
`

const [user, account] = await sql.begin(async sql => {
  const [user] = await sql`
    insert into users (
      name
    ) values (
      'Alice'
    )
  `

  const [account] = await sql`
    insert into accounts (
      user_id
    ) values (
      ${ user.user_id }
    )
  `

  return [user, account]
})


const [new_user] = await client`
  insert into reports (

  ) values (
    'Murray', 68
  )

  returning *
`
client.qu
*/