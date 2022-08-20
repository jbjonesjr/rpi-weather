import React from 'react';

import StyledWeatherDisplay from './styles/StyledWeatherDisplay';

const WeatherDisplay = ({ weather: { currentTemp, weatherMain, tempMax, tempMin, totalRainfall } }) => (
  <StyledWeatherDisplay>
    <h1>{Math.round(currentTemp)}<span>&#186;F</span> </h1>
    <h2>{weatherMain}</h2>
    <h3>Daily Alamanac (Min/Max): {Math.round(tempMin)}&#186;F / {Math.round(tempMax)}&#186;F {(totalRainfall+.00).toFixed(2)} in of rain</h3>
  </StyledWeatherDisplay>
);

export default WeatherDisplay;