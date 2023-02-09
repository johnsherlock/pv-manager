import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

interface DailyEnergyUsageLineGraphProps {
  data: any;
}

const convertJoulesToKwh = (joules: number) => (joules ? (joules / 3600000) : '');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const DailyEnergyUsageLineGraph = ({ data }: DailyEnergyUsageLineGraphProps): JSX.Element => {
  console.log(`Rendering line graph for ${data[0]?.dom}/${data[0]?.mon}/${data[0]?.yr}`);
  const lineData: ChartData<'line'> = {
    labels: data.map((item: { hr: { toString: () => string } }) => (item.hr ? item.hr.toString().padStart(2, '0') : '00')),
    datasets: [
      {
        label: 'Imported kWh',
        data: data.map((item: { imp: any }) => convertJoulesToKwh(item.imp)),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: 'Generated kWh',
        data: data.map((item: { gep: any }) => convertJoulesToKwh(item.gep)),
        fill: false,
        borderColor: 'rgb(51, 153, 102)',
        backgroundColor: 'rgba(51, 153, 102, 0.5)',
        pointBackgroundColor: 'rgba(51, 153, 102, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(51, 153, 102, 1)',
      },
      {
        label: 'Exported kWh',
        data: data.map((item: { exp: any }) => convertJoulesToKwh(item.exp)),
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

  const options: ChartOptions<'line'> = {
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

export default DailyEnergyUsageLineGraph;
