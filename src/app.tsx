import moment from 'moment-timezone';
import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { useSwipeable } from 'react-swipeable';
import Visibility from 'visibilityjs';
import Dashboard from './dashboard';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator } from './lib/energy-calculator';
import * as pvService from './lib/pv-service';
import { convertMinuteDataToHalfHourlyData, convertMinuteDataToHourlyData } from './lib/pv-service';
import * as stateUtils from './lib/state-utils';
import { MinutePVData } from './model/pv-data';

function App() {
  const [state, setState] = useState(stateUtils.initialState());

  const intervalRef = useRef(-1);
  let reactSwipeEl;

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
    console.log('Page visible - refreshing data every minute. Interval ID: ', intervalRef.current);
    intervalRef.current = Visibility.every(1 * 60 * 1000, async () => {
      await goToDay(selectedDate);
    });
    console.log(`Interval ID: ${intervalRef.current}`);
  };

  const stopAutoRefresh = () => {
    console.log('Stop auto refresh');
    if (intervalRef.current > -1) {
      console.log(`Stopping interval ${intervalRef.current}`);
      Visibility.stop(intervalRef.current);
      intervalRef.current = -1;
    }
  };

  const goToDay = async (targetDate: moment.Moment) => {
    console.log(`Getting data for ${targetDate}`, new Date());
    document.body.style.cursor = 'progress';
    const formattedTargetDate = dateUtils.formatDate(targetDate);
    if (state.pvDataCache.get(formattedTargetDate) && targetDate.isBefore(state.today)) {
      stopAutoRefresh();
      setState({
        ...state,
        today: moment().tz('Europe/London').startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
      });
      document.body.style.cursor = 'auto';
    } else {
      console.log('Fetching data from server');
      const pvData: MinutePVData[] = await pvService.getPVDataForDate(formattedTargetDate);
      console.log('State: ', state);
      const newState = {
        ...state,
        today: moment().tz('Europe/London').startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
        intervalId: null,
      };
      newState.pvDataCache.set(formattedTargetDate, pvData);
      setState(newState);
      console.log('IntervalRef: ', intervalRef.current);
      if (intervalRef.current == -1) {
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
    let nextDayData: MinutePVData[] = [];
    let previousDayData: MinutePVData[] = [];

    if (nextDay.isBefore(state.today) && !state.pvDataCache.get(formattedNextDay)) {
      nextDayData = await pvService.getPVDataForDate(formattedNextDay);
    }
    if (!state.pvDataCache.get(formattedPreviousDay)) {
      previousDayData = await pvService.getPVDataForDate(formattedPreviousDay);
    }
    if (nextDayData.length > 0) {
      console.log('Adding next day data to state');
      state.pvDataCache.set(formattedNextDay, nextDayData);
    }
    if (previousDayData.length > 0) {
      console.log('Adding previous day data to state');
      state.pvDataCache.set(formattedPreviousDay, previousDayData);
    }
  };

  useEffect(() => {
    console.log('USE EFFECT');

    // retrieve data for today.
    goToDay(state.selectedDate).catch((error) => {
      console.error(`Error retrieving data for ${state.selectedDate}`, error);
    });
    return () => {
      console.log(`Stopping refresh with id: ${intervalRef.current}`);
      Visibility.stop(intervalRef.current);
    };
  }, []);

  const canGoToPreviousDay = () => {
    return state.selectedDate.isAfter(dateUtils.dawnOfTime);
  };

  const canGoToNextDay = () => {
    return state.selectedDate.isBefore(state.today);
  };

  const goToPreviousDay = async (): Promise<any> => {
    await goToDay(moment(state.selectedDate.subtract(1, 'day')));
  };

  const goToNextDay = async () => {
    await goToDay(moment(state.selectedDate.add(1, 'day')));
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Query new data based on swipe direction
    if (direction === 'right' && canGoToPreviousDay()) {
      await goToPreviousDay();
    } else if (direction === 'left' && canGoToNextDay()) {
      await goToNextDay();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
  });


  return (
    <div {...handlers}>
      <Dashboard
        selectedDate={state.selectedDate}
        today={state.today}
        minuteData={state.pvDataCache.get(state.formattedSelectedDate) ?? []}
        halfHourData={convertMinuteDataToHalfHourlyData(state.pvDataCache.get(state.formattedSelectedDate))}
        hourData={convertMinuteDataToHourlyData(state.pvDataCache.get(state.formattedSelectedDate))}
        energyCalculator={energyCalculator}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        goToDay={goToDay}
      />
    </div>
  );
}

export default App;
