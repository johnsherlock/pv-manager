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
import { convertJoulesToKw, convertJoulesToKwh } from './lib/num-utils';
import { PVData } from './lib/pv-service';

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

const mapToXY = (
  type: 'hour' | 'halfHour' | 'minute',
  item: PVData, dataPoint: 'imp' | 'gep' | 'conp' | 'h1d' | 'exp'): { x: moment.Moment; y: number } => {
  // const convert = type === 'hour' || type === 'halfHour' ? convertJoulesToKwh : convertJoulesToKw;
  const yValue = type === 'minute' ? convertJoulesToKw(item[dataPoint]) : item[dataPoint];
  return { x: toMoment(item.hr, item.min), y: yValue };
};

export interface EnergyUsageLineGraphProps {
  data: PVData[];
  type: 'hour' | 'halfHour' | 'minute';
}

const EnergyUsageLineGraph = ({ data, type }: EnergyUsageLineGraphProps): JSX.Element => {

  const fill = type === 'minute';
  const borderWidth = type === 'minute' ? 1 : 2;
  const unit = type === 'minute' ? 'kw' : 'kWh';

  const lineData = {
    datasets: [
      {
        label: `Imported ${unit}`,
        data: data.map((item: PVData) => mapToXY(type, item, 'imp')),
        fill,
        borderColor: 'rgb(255, 99, 888)',
        backgroundColor: 'rgba(255, 99, 255, 0.5)',
        borderWidth,
        radius: 0,
        hidden: type === 'minute',
      },
      {
        label: `Generated ${unit}`,
        data: data.map((item: PVData) => mapToXY(type, item, 'gep')),
        fill,
        borderColor: 'rgb(51, 153, 102)',
        backgroundColor: 'rgba(51, 153, 102, 0.5)',
        borderWidth,
        radius: 0,
        hidden: false,
      },
      {
        label: `Consumed ${unit}`,
        data: data.map((item: PVData) => mapToXY(type, item, 'conp')),
        fill,
        borderColor: 'rgb(255, 153, 102)',
        backgroundColor: 'rgba(255, 153, 102, 0.5)',
        borderWidth,
        radius: 0,
        hidden: false,
      },
      {
        label: `Immersion ${unit}`,
        data: data.map((item: PVData) => mapToXY(type, item, 'h1d')),
        fill,
        borderColor: 'rgb(179, 0, 0)',
        backgroundColor: 'rgba(179, 0, 0, 0.5)',
        borderWidth,
        radius: 0,
        hidden: type === 'minute',
      },
      {
        label: `Exported ${unit}`,
        data: data.map((item: PVData) => mapToXY(type, item, 'exp')),
        fill,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth,
        radius: 0,
        hidden: type === 'minute',
      },
    ],
  };

  const decimation: DecimationOptions = {
    enabled: true,
    algorithm: 'lttb',
  };

  const handleClick = (event: any, legendItem: any, legend: any) => {

    legend.chart.getDatasetMeta(0).hidden = legendItem.datasetIndex == 1 || legendItem.datasetIndex == 3 || legendItem.datasetIndex == 4;
    legend.chart.getDatasetMeta(1).hidden = legendItem.datasetIndex == 0 || legendItem.datasetIndex == 2;
    legend.chart.getDatasetMeta(2).hidden = legendItem.datasetIndex == 1 || legendItem.datasetIndex == 3 || legendItem.datasetIndex == 4;
    legend.chart.getDatasetMeta(3).hidden = legendItem.datasetIndex == 0 || legendItem.datasetIndex == 2;
    legend.chart.getDatasetMeta(4).hidden = legendItem.datasetIndex == 0 || legendItem.datasetIndex == 2;
    legend.chart.update();
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
        // onClick: handleClick,
      },
    },
    scales: {
      y: {
        title: { display: true, text: type === 'minute' ? 'kw' : 'kWh' },
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

export default EnergyUsageLineGraph;