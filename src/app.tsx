import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import 'bootswatch/dist/cosmo/bootstrap.min.css';
import './app.css';
import CustomDatePicker from './custom-date-picker';
import DailyEnergyUsageLineGraph from './daily-energy-usage-line-graph';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator } from './lib/energy-calculator';
import * as pvService from './lib/pv-service';
import { HourlyUsageData } from './lib/pv-service';
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
    standingCharge: 0.7066,
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
    if (state.data.get(formattedTargetDate) && targetDate.isBefore(state.today)) {
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
      const data: HourlyUsageData[] = await pvService.getHourlyUsageDataForDate(formattedTargetDate);
      console.log('State: ', state);
      const newState = {
        ...state,
        today: moment().startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
        intervalId: null,
      };
      newState.data.set(formattedTargetDate, data);
      newState.totals.set(formattedTargetDate, energyCalculator.recalculateTotals(data));
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
    let nextDayData: HourlyUsageData[] = [];
    let previousDayData: HourlyUsageData[] = [];

    if (nextDay.isBefore(state.today) && !state.data.get(formattedNextDay)) {
      nextDayData = await pvService.getHourlyUsageDataForDate(formattedNextDay);
    }
    if (!state.data.get(formattedPreviousDay)) {
      previousDayData = await pvService.getHourlyUsageDataForDate(formattedPreviousDay);
    }
    if (nextDayData.length > 0) {
      console.log('Adding next day data to state');
      state.data.set(formattedNextDay, nextDayData);
      state.totals.set(formattedNextDay, energyCalculator.recalculateTotals(nextDayData));
    }
    if (previousDayData.length > 0) {
      console.log('Adding previous day data to state');
      state.data.set(formattedPreviousDay, previousDayData);
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
    <div className="container grid-container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9">
          <div className="navigation">
            <h1>
              <div className="navPrev">
                {state.selectedDate.isAfter(dateUtils.dawnOfTime) ? <div className="navigationButton" onClick={goToPreviousDay}>&lt;&lt;</div> : null}
              </div>
              <div className="date">
                <CustomDatePicker
                  selectedDate={state.selectedDate}
                  onChange={goToDay}
                />
              </div>
              <div className="navNext">
                {state.selectedDate.isBefore(state.today) ? <div className="navigationButton" onClick={goToNextDay}>&gt;&gt;</div> : null}
              </div>
            </h1>
          </div>
          <DailyEnergyUsageTable
            data={state.data.get(state.formattedSelectedDate)}
            totals={state.totals.get(state.formattedSelectedDate)}
            energyCalculator={energyCalculator}
          />
          <div className="chart">
            <DailyEnergyUsageLineGraph data={state.data.get(state.formattedSelectedDate) || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
