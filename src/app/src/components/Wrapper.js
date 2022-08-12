import React from 'react';

import SearchBox from './SearchBox';
import Geolocation from './Geolocation';
import WeatherDisplay from './WeatherDisplay';

import StyledWrapper from './styles/StyledWrapper';
import StyledGeolocation from './styles/StyledGeolocation';

const Wrapper = ({ handleInput, handleSubmit, states }) => (
  <StyledWrapper>
    <StyledGeolocation>
        {/* <h1> Hamamatsu, JP </h1> */}
        <h1> {location.city} </h1>
        <h1> {location.state}, {location.country} </h1>
        <h3> {currentDate} </h3>
        {/* <h3> Thusday 10 January 2020 </h3> */}
    </StyledGeolocation>    
    <WeatherDisplay weather={states.weather} />
  </StyledWrapper>
);

export default Wrapper;