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
import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment';
import { isTouchScreen } from './lib/display-utils';
import { CalendarScale } from './lib/state-utils';
import { DayTotals } from '../shared/pv-data';

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

const toMoment = (day: number = 0, month: number = 0, year: number = 0): moment.Moment => {
  return moment({ year, month: month - 1, day });
};

export type View = 'line' | 'cumulative';
type DataPoint = 'genTotal' | 'expTotal' | 'conpTotal' | 'peakImpTotal' | 'nightImpTotal' | 'dayImpTotal' | 'combinedImpTotal' | 'freeImpTotal';

export interface RangeEnergyUsageLineGraphProps {
  data: DayTotals[];
  calendarScale: CalendarScale;
  view: View;
}

const getDataForView = (props: RangeEnergyUsageLineGraphProps, dataPoint: DataPoint): { x: moment.Moment; y: number }[] => {

  let data: { x: moment.Moment; y: number }[];

  data = props.data.map((item) => ({ x: toMoment(item.dayOfMonth, item.month, item.year), y: item[dataPoint] }));

  // Sort the array by the 'x' property (date) in ascending order
  data.sort((a, b) => a.x.valueOf() - b.x.valueOf());

  return props.view === 'line'? data : convertToCumulativeView(data);
};

const convertToCumulativeView = (data: { x: moment.Moment; y: number }[]): { x: moment.Moment; y: number }[] => {
  let cumulativeY = 0;
  return data.map(item => {
    cumulativeY += item.y;
    return { x: item.x, y: cumulativeY };
  });
};

const RangeEnergyUsageLineGraph = (props: RangeEnergyUsageLineGraphProps): JSX.Element => {

  const fill = false;
  const borderWidth = props.view !== 'cumulative' ? 1 : 1;
  const unit = 'kWh';

  // create a map of the data based on the view type (hour, halfHour, minute).
  // if the view is minute, then we use the minute data, otherwise we use the halfHour or hour data.

  const lineData = {
    datasets: [
      {
        label: `Imp ${unit}`,
        data: getDataForView(props, 'combinedImpTotal'),
        fill,
        borderColor: 'rgb(255, 99, 888)',
        backgroundColor: 'rgba(255, 99, 255, 0.5)',
        borderWidth,
        radius: 0,
      },
      {
        label: `Gen ${unit}`,
        data: getDataForView(props, 'genTotal'),
        fill,
        borderColor: 'rgb(51, 153, 102)',
        backgroundColor: 'rgba(51, 153, 102, 0.5)',
        borderWidth,
        radius: 0,
      },
      {
        label: `Exp ${unit}`,
        data: getDataForView(props, 'expTotal'),
        fill,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth,
        radius: 0,
      },
      {
        label: `Consumed ${unit}`,
        data: getDataForView(props, 'conpTotal'),
        fill,
        borderColor: 'rgb(255, 153, 102)',
        backgroundColor: 'rgba(255, 153, 102, 0.5)',
        borderWidth,
        radius: 0,
      },
      {
        label: `Free ${unit}`,
        data: getDataForView(props, 'freeImpTotal'),
        fill,
        borderColor: 'rgb(179, 0, 0)',
        backgroundColor: 'rgba(179, 0, 0, 0.5)',
        borderWidth,
        radius: 0,
      },
    ],
  };

  const decimation: DecimationOptions = {
    enabled: true,
    algorithm: 'lttb',
  };

  const options = {
    maintainAspectRatio: false as const,
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
      tooltip: {
        enabled: !isTouchScreen(),
      },
    },
    scales: {
      y: {
        title: { display: !isTouchScreen(), text: 'kWh' },
      },
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
      },
    },
    elements: {
      point: {
        pointStyle: isTouchScreen() ? 'dash' : 'circle',
      },
    },
  };

  return (
    <Line options={options} data={lineData} />
  );
};

export default RangeEnergyUsageLineGraph;