import moment from 'moment';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await getDataForDate(state.selectedDate);
    }, 1 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // TODO: Initialise this dynamically (from props or per user)
  const energyCalculator = new EnergyCalculator({
    dayRate: 0.4673,
    peakRate: 0.5709,
    nightRate: 0.3434,
    exportRate: 0.1850,
    discountPercentage: 0.15,
    standingCharge: 0.7066,
  });

  const getDataForDate = async (targetDate: moment.Moment) => {
    console.log(`Getting data for ${targetDate}`);
    document.body.style.cursor = 'progress';
    const formattedTargetDate = dateUtils.formatDate(targetDate);
    if (state.data[formattedTargetDate] && targetDate.isBefore(state.today)) {
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
      const newState = {
        ...state,
        today: moment().startOf('day'),
        selectedDate: targetDate,
        formattedSelectedDate: formattedTargetDate,
      };
      newState.data[formattedTargetDate] = data;
      newState.totals[formattedTargetDate] = energyCalculator.recalculateTotals(data);
      setState(newState);
      document.body.style.cursor = 'auto';
    }
  };

  useEffect(() => {
    // retrieve data for today.
    getDataForDate(state.selectedDate).catch((error) => {
      console.error(`Error retrieving data for ${state.selectedDate}`, error);
    });
  }, []);

  const goToPreviousDay = async (): Promise<any> => {
    await getDataForDate(moment(state.selectedDate.subtract(1, 'day')));
  };

  const goToNextDay = async () => {
    await getDataForDate(moment(state.selectedDate.add(1, 'day')));
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
                  onChange={getDataForDate}
                />
              </div>
              <div className="navNext">
                {state.selectedDate.isBefore(state.today) ? <div className="navigationButton" onClick={goToNextDay}>&gt;&gt;</div> : null}
              </div>
            </h1>
          </div>
          <DailyEnergyUsageTable
            data={state.data[state.formattedSelectedDate] || []}
            totals={state.totals[state.formattedSelectedDate] || []}
            energyCalculator={energyCalculator}
          />
          <div className="chart">
            <DailyEnergyUsageLineGraph data={state.data[state.formattedSelectedDate] || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
