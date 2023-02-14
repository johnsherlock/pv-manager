import moment from 'moment';
import { useState, useEffect } from 'react';
import 'bootswatch/dist/cosmo/bootstrap.min.css';
import './App.css';
import CustomDatePicker from './CustomDatePicker';
import DailyEnergyUsageLineGraph from './DailyEnergyUsageLineGraph';
import DailyEnergyUsageTable from './DailyEnergyUsageTable';
import * as costUtils from './lib/costUtils';
import * as dateUtils from './lib/dateUtils';
import * as pvService from './lib/pvService';
import { HourlyUsageData } from './lib/pvService';
import * as stateUtils from './lib/stateUtils';

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
      newState.totals[formattedTargetDate] = costUtils.recalculateTotals(data);
      setState(newState);
      document.body.style.cursor = 'auto';
    }
  };

  useEffect(() => {
    // retrieve data for today.
    getDataForDate(state.selectedDate).catch(() => {
      console.error(`Error retrieving data for ${state.selectedDate}`);
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
          <DailyEnergyUsageTable data={state.data[state.formattedSelectedDate] || []} totals={state.totals[state.formattedSelectedDate] || []} />
          <div className="chart">
            <DailyEnergyUsageLineGraph data={state.data[state.formattedSelectedDate] || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
