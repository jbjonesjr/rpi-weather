import React from 'react';

import WeatherDisplay from './WeatherDisplay';
import TemperatureExtremes from './Temp-chart.js';

import StyledWrapper from './styles/StyledWrapper';
import StyledGeolocation from './styles/StyledGeolocation';

const Wrapper = ({ handleInput, handleSubmit, states, currentDate }) => (
  <StyledWrapper>
    <StyledGeolocation>
        <h1> Waynewood </h1>
        <h3> {states.currentDate} </h3>
    </StyledGeolocation>    
    <WeatherDisplay weather={states.weather} />
    <TemperatureExtremes />
  </StyledWrapper>
);

export default Wrapper;