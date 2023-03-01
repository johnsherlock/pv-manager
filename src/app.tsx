import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import 'bootswatch/dist/cosmo/bootstrap.min.css';
import './app.css';
import Dashboard from './dashboard';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator } from './lib/energy-calculator';
import * as pvService from './lib/pv-service';
import { convertMinuteDataToHalfHourlyData, convertMinuteDataToHourlyData, PVData } from './lib/pv-service';
import * as stateUtils from './lib/state-utils';

function App() {
  const [state, setState] = useState(stateUtils.initialState());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // TODO: Initialise this dynamically (from props or per user)
  const energyCalculator = new EnergyCalculator({
    dayRate: 0.4673,
    peakRate: 0.5709,
    nightRate: 0.3434,
    exportRate: 0.1850,
    discountPercentage: 0.15,
    annualStandingCharge: 257.91,
  });

  const startAutoRefresh = (selectedDate: moment.Moment) => {
    console.log('Setting up interval to refresh data every minute');
    intervalRef.current = setInterval(async () => {
      await goToDay(selectedDate);
    }, 1 * 60 * 1000);
    console.log(`Interval ID: ${intervalRef.current}`);
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      console.log(`Clearing interval ${intervalRef.current}`);
      clearInterval(intervalRef.current as NodeJS.Timeout);
      intervalRef.current = null;
    }
  };

  const goToDay = async (targetDate: moment.Moment) => {
    console.log(`Getting data for ${targetDate}`);
    document.body.style.cursor = 'progress';
    const formattedTargetDate = dateUtils.formatDate(targetDate);
    if (state.pvDataCache.get(formattedTargetDate) && targetDate.isBefore(state.today)) {
      stopAutoRefresh();
      setState({
        ...state,
        today: moment().startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
      });
      document.body.style.cursor = 'auto';
    } else {
      console.log('Fetching data from server');
      const pvData: PVData[] = await pvService.getPVDataForDate(formattedTargetDate);
      console.log('State: ', state);
      const newState = {
        ...state,
        today: moment().startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
        intervalId: null,
      };
      newState.pvDataCache.set(formattedTargetDate, pvData);
      newState.totals.set(formattedTargetDate, energyCalculator.recalculateTotals(pvData));
      setState(newState);
      if (!intervalRef.current) {
        startAutoRefresh(state.today);
      }
      document.body.style.cursor = 'auto';
    }
    await preFetchData(targetDate);
  };

  const preFetchData = async (targetDate: moment.Moment) => {
    console.log(`Pre-fetching data for days either side of ${targetDate}`);
    const nextDay = moment(targetDate).add(1, 'day');
    const formattedNextDay = dateUtils.formatDate(nextDay);
    const previousDay = moment(targetDate).subtract(1, 'day');
    const formattedPreviousDay = dateUtils.formatDate(previousDay);
    let nextDayData: PVData[] = [];
    let previousDayData: PVData[] = [];

    if (nextDay.isBefore(state.today) && !state.pvDataCache.get(formattedNextDay)) {
      nextDayData = await pvService.getPVDataForDate(formattedNextDay);
    }
    if (!state.pvDataCache.get(formattedPreviousDay)) {
      previousDayData = await pvService.getPVDataForDate(formattedPreviousDay);
    }
    if (nextDayData.length > 0) {
      console.log('Adding next day data to state');
      state.pvDataCache.set(formattedNextDay, nextDayData);
      state.totals.set(formattedNextDay, energyCalculator.recalculateTotals(nextDayData));
    }
    if (previousDayData.length > 0) {
      console.log('Adding previous day data to state');
      state.pvDataCache.set(formattedPreviousDay, previousDayData);
      state.totals.set(formattedPreviousDay, energyCalculator.recalculateTotals(previousDayData));
    }
  };

  useEffect(() => {
    console.log('USE EFFECT');
    // retrieve data for today.
    goToDay(state.selectedDate).catch((error) => {
      console.error(`Error retrieving data for ${state.selectedDate}`, error);
    });
    return () => {
      console.log(`Clearing interval ${intervalRef.current}`);
      clearInterval(intervalRef.current as NodeJS.Timeout);
    };
  }, []);

  const goToPreviousDay = async (): Promise<any> => {
    await goToDay(moment(state.selectedDate.subtract(1, 'day')));
  };

  const goToNextDay = async () => {
    await goToDay(moment(state.selectedDate.add(1, 'day')));
  };

  return (
    <Dashboard
      selectedDate={state.selectedDate}
      today={state.today}
      minuteData={state.pvDataCache.get(state.formattedSelectedDate)}
      halfHourData={convertMinuteDataToHalfHourlyData(state.pvDataCache.get(state.formattedSelectedDate))}
      hourData={convertMinuteDataToHourlyData(state.pvDataCache.get(state.formattedSelectedDate))}
      totals={state.totals.get(state.formattedSelectedDate)}
      energyCalculator={energyCalculator}
      goToPreviousDay={goToPreviousDay}
      goToNextDay={goToNextDay}
      goToDay={goToDay}
    />
  );
}

export default App;
