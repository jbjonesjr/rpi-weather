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
    tempMin: 0
  });

  const dateBuilder = (d) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${date} ${month} ${year} (${d.getHours()%12}:${d.getMinutes()} ${d.getHours() > 12 ? 'PM' : 'AM'})`;
  }

  async function fetchData() {
    const now = new Date();
    const response = await getWeather();
    setCurrentDate(dateBuilder(response.observation_time));
    return response;
  }

  useEffect(() => {
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