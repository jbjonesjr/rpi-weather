import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from 'react-chartjs-2';
import { getTemperatureExtremes } from '../utils/fetchHelpers';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

useEffect(() => {
  console.debug('use effect called');
  getTemperatureExtremes().then(([data]) => {
    data.each((item) => {
      console.debug(item);
    });
  });
}, []);

let data = {
  // an array of hours in the day
  
  labels: ["Midnight", "1","2","3","4","5","6","7","8","9","10","11","Noon", "1","2","3","4","5","6","7","8","9","10","11"],
  datasets: [
    {
      label: 'My Dataset',
      data: [[5,10], [10,20], [19,26], [26,27], [27,29], [27,28], [25,27], [20,25]],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
};

const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        // legend: {
        //   position: 'top',
        // },
        title: {
          display: false,
          text: "Today's hourly temperature ranges"
        }
      }
    }
  };
  
const BarChart = () => {
  return <Bar data={config.data} options={config.options} />;
};

export default BarChart;