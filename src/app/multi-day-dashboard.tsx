import moment from 'moment';
import React, { useReducer } from 'react';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import EnergyCostLineGraph, { View } from './energy-cost-line-graph';
import EnergyUsageLineGraph, { Scale } from './energy-usage-line-graph';
import GreenEnergyPercentageLineGraph from './green-energy-percentage-line-graph';
import { CalendarScale } from './lib/state-utils';
import LiveEnergyBarGraph from './live-energy-bar-graph';
import OptionLink from './option-link';
import { dashboardReducer, initialState } from './reducers/dashboardReducer';
import ResponsiveEnergyUsageTable from './responsive-energy-usage-table';
import { EnergyCalculator } from '../shared/energy-calculator';
import { MinutePVData, HalfHourlyPVData, HourlyPVData, Totals } from '../shared/pv-data';

interface MultiDayDashboardProps {
  dispatch: React.Dispatch<any>;
  selectedDate: moment.Moment;
  startDate?: moment.Moment;
  endDate?: moment.Moment | null;
  today: moment.Moment;
  minuteData: MinutePVData[];
  halfHourData: HalfHourlyPVData[];
  hourData: HourlyPVData[];
  totals?: Totals;
  energyCalculator: EnergyCalculator;
  energyUsageLineGraphScale: Scale;
  energyUsageLineGraphView: View;
  calendarScale: CalendarScale;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToDay: (date: Date | [Date | null, Date | null]) => void;
}

const MultiDayDashboard = (
  {
    selectedDate, today, minuteData, halfHourData, hourData, totals, energyCalculator, goToPreviousDay, goToNextDay, goToDay,
    energyUsageLineGraphScale, energyUsageLineGraphView, dispatch,
  }:
  MultiDayDashboardProps): JSX.Element => {

  // const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const isToday = selectedDate.isSame(today);

  return (
    <div>Multi Day</div>
  );
};
export default MultiDayDashboard;