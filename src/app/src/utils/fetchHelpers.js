
// API_BASE defaults to '' so that all requests use relative URLs when the React
// app is served by the Express server (production / Heroku).
// Set REACT_APP_API_URL only when running the React dev server separately from
// the Express API, e.g. REACT_APP_API_URL=http://localhost:5000
const RAW_API_BASE = process.env.REACT_APP_API_URL || '';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');
const today = new Date();
const conditions_url = `${API_BASE}/api/weather/current`;
const almanac_url = `${API_BASE}/api/weather/almanac/today`;
const t_e_url = `${API_BASE}/api/weather/almanac/extremes/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;


export const getWeather = async () => {

  console.log('fetching weather data');

  const conditions_data = await fetch(conditions_url).then(resp => resp.json()).then(result => {
    return result;
  });

  const almanac_data = await fetch(almanac_url).then(resp => resp.json()).then(result => {
    return result;
  });

  console.debug("api results",conditions_data, almanac_data);
  return [{ observation_time: conditions_data.obs, currentTemp: conditions_data.temperature_f, weatherMain: "unk", "tempMax": almanac_data.max_temp, "tempMin": almanac_data.min_temp, "totalRainfall": almanac_data.total_rainfall }, "Waynewood"];
}

export const getTemperatureExtremes = async () => {
  console.debug('fetching temperature extremes');
  return fetch(t_e_url)
  .then(resp => resp.json())
  .then(result => {
    console.debug('getTemperatureExtremes', result);
    return result;
  })};