
export const getWeather = async (location) => {

 const urlJBJ = `https://weather-rpi.herokuapp.com/api/weather/current`;

  //const weatherResult = await fetch(URL).then(data => data.json()).then(result => result);
  const jbjResult = await fetch(urlJBJ).then(result => result);

  console.log(jbjResult);
  // jbjResult
    return [{ data:100, "wx":"unk", "wxmain":"unk", "tempMax":jbjResult.temperature_max, "tempMin":100}, "Waynewood" ];

  // const currentTemp = weatherResult.current.temp;
  // const todayWeather = weatherResult.daily[0];
  // const weatherMain = todayWeather.weather[0].main;
  // const tempMax = todayWeather.temp.max;
  // const tempMin = todayWeather.temp.min;

  // return [{ currentTemp, weatherMain, tempMax, tempMin }, "Waynewood"];
}