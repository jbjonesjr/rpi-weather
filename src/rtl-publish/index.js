const { Client } = require('pg');
//docs: https://www.npmjs.com/package/postgres

let spawn = require('child_process').spawn;
const {chunksToLinesAsync, chomp} = require('@rauschma/stringio');

const mode = 'weather';
const weatherModels = ["-R","166","-R","175"];
const allModels = [];

var options = {
  stdio: ["ignore", "pipe", process.stderr]
};
 console.log("Here is the complete output of the program: ");
 if(mode == 'weather'){
  var child = spawn("rtl_433", ["-f", "915M", "-F", "csv"].concat(weatherModels),options);
 }else{
  var child = spawn("rtl_433", ["-f", "915M", "-F", "csv"].concat(allModels),options);
 }
 
 echoReadable(child.stdout); // (B)

 console.log('### DONE initial load');

  async function echoReadable(readable) {
    for await (const line of chunksToLinesAsync(readable)) { // (C)
      console.log('LINE: '+chomp(line))
      datas = {};
      datas = line.split(",")
      if(datas.length == 15 && mode == 'weather') //Data Length varies, based on RTL-433 formats/parameters passed in
      // this is only good for weather formats (-R 166 and -R 175 are the key for me)
      // But I should probably look for new devices as well....
        result = {}
        result = {
            "dtg": datas[0],
            "model": datas[3],
            "sensorId": datas[4],
            "seq": datas[5],
            "lowbattery": datas[6],
            "temperatureC": parseFloat(datas[7]),
            "humidity": parseInt(datas[8]),
            "wind_kph": parseFloat(datas[9]),
            "wind_dir": parseInt(datas[10]),
            "rain1": parseFloat(datas[12]),
            "rain2": parseFloat(datas[13]),
        }
        console.log("Got measure (model:" + result.model + ", sensorId: " + result.sensorId + ", channel: " + result.channel + ", lowbattery:" + result.lowbattery + ", TempC:" + result.temperatureC + ", Humidity:" + result.humidity + ", TempF:" + result.temperatureF + ")");
        console.log('details', result);

    }
  }

/*

inspired by https://github.com/Ax-LED/pimatic-rtl433/blob/master/rtl433.coffee
for reference: https://github.com/merbanan/rtl_433
  spawn = require('child_process').spawn
      proc = spawn("#{__dirname}/bin/rtl_433",['-f', @config.freq, '-R', '03', '-R', '19', '-R', '52', '-R', '141', '-F', 'csv', '-l', @config.detectionLevel])

       proc.stdout.setEncoding('utf8')
      proc.stderr.setEncoding('utf8')
      rl = readline.createInterface({ input: proc.stdout })

      rl.on('line', (line) => 
        @_dataReceived(line)
      )

      proc.stderr.on('data',(data) =>
        lines = data.split(/(\r?\n)/g)
        env.logger.warn line for line in lines when line.trim() isnt ''
      )

      proc.on('close',(code) =>
        if code!=0
          env.logger.error "rtl_433 returned", code
        rl.close()
      )

    _dataReceived: (data) ->
      env.logger.debug data
      datas = {};
      datas = data.split(",")
      if datas.length == 15 #Data Length variiert, abhängig von den RTL_433 Parametern
        result = {}
        result = {
            "model": datas[3],
            "sensorId": datas[5],
            "channel": datas[7],
            "lowbattery": datas[8],
            "temperatureC": parseFloat(datas[9]),
            "humidity": parseInt(datas[10]),
            "temperatureF": parseFloat(datas[12])
        }
        env.logger.debug "Got measure (model:" + result.model + ", sensorId: " + result.sensorId + ", channel: " + result.channel + ", lowbattery:" + result.lowbattery + ", TempC:" + result.temperatureC + ", Humidity:" + result.humidity + ", TempF:" + result.temperatureF + ")"
        @emit('temp', result)


*/

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