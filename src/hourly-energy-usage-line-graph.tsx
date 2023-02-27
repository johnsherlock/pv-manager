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
import { convertJoulesToKwh } from './lib/num-utils';
import { DailyEnergyUsageProps, PVData } from './lib/pv-service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const HourlyEnergyUsageLineGraph = ({ data }: DailyEnergyUsageProps): JSX.Element => {
  console.log(`Rendering line graph for ${data[0]?.dom}/${data[0]?.mon}/${data[0]?.yr}`);
  const lineData = {
    labels: data.map((item: { hr: { toString: () => string } }) => (item.hr ? item.hr.toString().padStart(2, '0') : '00')),
    datasets: [
      {
        label: 'Imported kWh',
        data: data.map((item: PVData) => convertJoulesToKwh(item.imp)),
        fill: false,
        borderColor: 'rgb(255, 99, 888)',
        backgroundColor: 'rgba(255, 99, 255, 0.5)',
        pointBackgroundColor: 'rgba(255, 99, 888, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 888, 1)',
      },
      {
        label: 'Generated kWh',
        data: data.map((item: PVData) => convertJoulesToKwh(item.gep)),
        fill: false,
        borderColor: 'rgb(51, 153, 102)',
        backgroundColor: 'rgba(51, 153, 102, 0.5)',
        pointBackgroundColor: 'rgba(51, 153, 102, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(51, 153, 102, 1)',
      },
      {
        label: 'Consumed kWh',
        data: data.map((item: PVData) => convertJoulesToKwh(item.conp)),
        fill: false,
        borderColor: 'rgb(255, 153, 102)',
        backgroundColor: 'rgba(255, 153, 102, 0.5)',
        pointBackgroundColor: 'rgba(255, 153, 102, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 153, 102, 1)',
      },
      {
        label: 'Immersion kWh',
        data: data.map((item: PVData) => convertJoulesToKwh(item.h1d)),
        fill: false,
        borderColor: 'rgb(179, 0, 0)',
        backgroundColor: 'rgba(179, 0, 0, 0.5)',
        pointBackgroundColor: 'rgba(179, 0, 0, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(179, 0, 0, 1)',
      },
      {
        label: 'Exported kWh',
        data: data.map((item: PVData) => convertJoulesToKwh(item.exp)),
        fill: false,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        pointBackgroundColor: 'rgba(53, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        title: { display: true, text: 'kWh' },
      },
      x: {
        title: { display: true, text: 'Hour of Day' },
      },
    },
  };

  return (
    <Line options={options} data={lineData} />
  );
};

export default HourlyEnergyUsageLineGraph;