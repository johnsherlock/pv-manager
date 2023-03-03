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
type DataPoint = 'imported' | 'generated' | 'consumed' | 'immersionDiverted' | 'exported';

export interface EnergyUsageLineGraphProps {
  minutePvData: MinutePVData[];
  halfHourPvData: HalfHourlyPVData[];
  hourlyPvData: HourlyPVData[];
  view: View;
}

const getDataForView = (props: EnergyUsageLineGraphProps, dataPoint: DataPoint): { x: moment.Moment; y: number }[] => {
  if (props.view === 'minute') {
    return props.minutePvData.map((item) => ({ x: toMoment(item.hour, item.minute), y: convertJoulesToKw(item[`${dataPoint}Joules`]) }));
  } else if (props.view === 'halfHour') {
    return props.halfHourPvData.map((item) => ({ x: toMoment(item.hour, item.minute), y: item[`${dataPoint}KwH`] }));
  } else {
    return props.hourlyPvData.map((item) => ({ x: toMoment(item.hour, item.minute), y: item[`${dataPoint}KwH`] }));
  }
};

const EnergyUsageLineGraph = (props: EnergyUsageLineGraphProps): JSX.Element => {

  const fill = props.view === 'minute';
  const borderWidth = props.view === 'minute' ? 1 : 2;
  const unit = props.view === 'minute' ? 'kw' : 'kWh';

  // create a map of the data based on the view type (hour, halfHour, minute).
  // if the view is minute, then we use the minute data, otherwise we use the halfHour or hour data.


  const lineData = {
    datasets: [
      {
        label: `Imported ${unit}`,
        data: getDataForView(props, 'imported'),
        fill,
        borderColor: 'rgb(255, 99, 888)',
        backgroundColor: 'rgba(255, 99, 255, 0.5)',
        borderWidth,
        radius: 0,
        hidden: props.view === 'minute',
      },
      {
        label: `Generated ${unit}`,
        data: getDataForView(props, 'generated'),
        fill,
        borderColor: 'rgb(51, 153, 102)',
        backgroundColor: 'rgba(51, 153, 102, 0.5)',
        borderWidth,
        radius: 0,
        hidden: false,
      },
      {
        label: `Consumed ${unit}`,
        data: getDataForView(props, 'consumed'),
        fill,
        borderColor: 'rgb(255, 153, 102)',
        backgroundColor: 'rgba(255, 153, 102, 0.5)',
        borderWidth,
        radius: 0,
        hidden: false,
      },
      {
        label: `Immersion ${unit}`,
        data: getDataForView(props, 'immersionDiverted'),
        fill,
        borderColor: 'rgb(179, 0, 0)',
        backgroundColor: 'rgba(179, 0, 0, 0.5)',
        borderWidth,
        radius: 0,
        hidden: props.view === 'minute',
      },
      {
        label: `Exported ${unit}`,
        data: getDataForView(props, 'exported'),
        fill,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth,
        radius: 0,
        hidden: props.view === 'minute',
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
        title: { display: true, text: props.view === 'minute' ? 'kw' : 'kWh' },
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