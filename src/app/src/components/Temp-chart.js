import React from 'react';
import { Bar } from 'react-chartjs-2';

const data = {
  labels: ["Midnight", "3 AM", "6 AM", "9 AM", "Noon", "3 PM", "6 PM", "9 PM"],
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

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: false,
        },
      },
    ],
  },
};

const BarChart = () => {
  return <Bar data={data} options={options} />;
};

export default BarChart;