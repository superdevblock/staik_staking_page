import React, { useState, useEffect, useCallback } from 'react'; // react componet
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
const Linechart = ({ xData, yData }) => {
  const [ data, setData ] = useState({
    labels: [],
    datasets: []
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        display: false
      },
      title: {
        display: false,
        text: '',
      },
    },
    tooltips: {
      mode: 'index',
      intersect: true,
      callbacks: {
        label: function(tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label || '';
  
          if (label) {
            label += ': ';
          }
          label += '$' + tooltipItem.yLabel.toFixed(2);
          return label;
        }
      }
    }
  };
  
  useEffect(() => {
    let datas = {
      labels: xData,
      title:"11",
      datasets: [
        {
          label: '',
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: yData
        }
      ]
    };

    setData(datas);
  }, []);
  
  return (
    <div style={{ width: '100%' }}>
      <Line data={ data } options={ options } />
    </div>
  )
}

export default Linechart;