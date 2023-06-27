import React, { useState, useEffect } from 'react';

import Wrapper from './Wrapper';

import { getWeather } from '../utils/fetchHelpers';
import StyledWeather from './styles/StyledWeather';

const Weather = () => {

  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState({
    currentTemp: 0,
    weatherMain: '',
    tempMax: 0,
    tempMin: 0,
    totalRainfall: 0
    });

  const dateBuilder = (d) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${date} ${month} ${year} (${d.getHours()%12 === 0 ? 12 : d.getHours()%12}:${String(d.getMinutes()).padStart(2,0)} ${d.getHours() >= 12 ? 'PM' : 'AM'})`;
  }

  useEffect(() => {
    async function fetchData() {
      const response = await getWeather();
      let dt = new Date(Date.parse(response[0].observation_time));
      setCurrentDate(dateBuilder(dt));
      return response;
    }
    
    console.debug('use effect called');
    fetchData().then(([newWeather]) => {
      setWeather(newWeather);
    });
    
  }, []);

  const setBackground = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour <= 7 || hour > 18) {
      return 'blue';
    }
    if (hour > 7 && hour <= 15) {
      return 'green';
    }
    return 'orange';
  }

  return (
    <StyledWeather bgImage={setBackground()}>
      <Wrapper states={{ currentDate, weather }} />
    </StyledWeather>
  );
}

export default Weather;