import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend,
  Filler,
  Decimation,
  DecimationOptions,
} from 'chart.js';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment';
import { convertJoulesToKw } from './lib/num-utils';
import { HalfHourlyPVData, HourlyPVData, MinutePVData } from './lib/pv-service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend,
  Decimation,
  Filler,
);

const toMoment = (hr: number = 0, min: number = 0): moment.Moment => {
  return moment().hour(hr).minute(min);
};

export type View = 'minute' | 'halfHour' | 'hour';

export interface EnergyUsageLineGraphProps {
  halfHourPvData: HalfHourlyPVData[];
}

const getData = (halfHourPvData: HalfHourlyPVData[]): { x: moment.Moment; y: number }[] => {

  // filter out items from halfHourlyData where greenEnergyPercentage is 0
  // map the remaining items to an array of objects with x and y properties

  const filteredData = halfHourPvData.filter((item) => item.greenEnergyPercentage !== 0);
  const mappedData = filteredData.map((item) => ({ x: toMoment(item.hour, item.minute), y: item.greenEnergyPercentage }));

  return mappedData;
};


const GreenEnergyPercentageLineGraph = (props: EnergyUsageLineGraphProps): JSX.Element => {

  // create a map of the data based on the view type (hour, halfHour, minute).
  // if the view is minute, then we use the minute data, otherwise we use the halfHour or hour data.

  const lineData = {
    datasets: [
      {
        label: 'Green Energy Percentage',
        data: getData(props.halfHourPvData),
        fill: true,
        borderColor: 'rgb(51, 153, 102)',
        backgroundColor: 'rgba(51, 153, 102, 0.5)',
        borderWidth: 1,
        radius: 0,
        hidden: false,
      },
    ],
  };

  const decimation: DecimationOptions = {
    enabled: true,
    algorithm: 'lttb',
  };

  const options = {
    responsive: true as const,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    plugins: {
      decimation: decimation,
      legend: {
      },
    },
    scales: {
      y: {
        title: { display: true, text: 'Green Energy %' },
      },
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
        },
      },
    },
  };

  return (
    <Line options={options} data={lineData} />
  );
};

export default GreenEnergyPercentageLineGraph;