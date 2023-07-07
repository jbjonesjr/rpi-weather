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
  
const BarChart = () => {

  const [hourlyTempRanges] = useState({
    data:[],
    min: 100,
    max: 0
    });

  useEffect(() => {
    console.debug('use effect called');
    getTemperatureExtremes().then((temp_results) => {
    //  console.log("data results", temp_results);
      temp_results.forEach((item) => {
        console.debug(item, hourlyTempRanges);
        hourlyTempRanges.min = Math.min(hourlyTempRanges.min, Math.round(item['min_temp']*10)/10);
        hourlyTempRanges.max = Math.max(hourlyTempRanges.max, Math.round(item['max_temp']*10)/10);
        hourlyTempRanges.data.push([Math.round(item['min_temp']*10)/10,Math.round(item['max_temp']*10)/10]);
      });

    });
  }, [hourlyTempRanges]);
  
  let data = {
    // an array of hours in the day
    
    labels: ["Midnight", "1","2","3","4","5","6","7","8","9","10","11","Noon", "1","2","3","4","5","6","7","8","9","10","11"],
    datasets: [
      {
        label: 'Temperature Range',
        data: hourlyTempRanges.data,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barPercentage: 0.3
      },
    ],
  };
  
  const config = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10,
          },
        },
        elements: {
          bar: {
            borderSkipped: false,
          },
        },
        scales: {
          y: {
            min: hourlyTempRanges.min-10,
            max: hourlyTempRanges.max+10
          }
        },
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

  return <Bar data={config.data} options={config.options} />;
};

export default BarChart;