import moment from 'moment';
import React, { useReducer } from 'react';
import CustomDatePicker from './custom-date-picker';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import EnergyUsageLineGraph from './energy-usage-line-graph';
import GreenEnergyPercentageLineGraph from './green-energy-percentage-line-graph';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import { MinutePVData, HalfHourlyPVData, HourlyPVData } from './lib/pv-service';
import LiveEnergyBarGraph from './live-energy-bar-graph';
import OptionLink from './option-link';
import { dashboardReducer, initialState } from './reducers/dashboardReducer';

interface DashboardProps {
  selectedDate: moment.Moment;
  today: moment.Moment;
  minuteData: MinutePVData[];
  halfHourData: HalfHourlyPVData[];
  hourData: HourlyPVData[];
  totals?: Totals;
  energyCalculator: EnergyCalculator;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToDay: (targetDate: moment.Moment) => void;
}

const Dashboard = (
  { selectedDate, today, minuteData, halfHourData, hourData, totals, energyCalculator, goToPreviousDay, goToNextDay, goToDay }:
  DashboardProps): JSX.Element => {

  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <div className="container grid-container dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10">
          <div className="navigation">
            <h1>
              <div className="navPrev">
                {selectedDate.isAfter(dateUtils.dawnOfTime) ? <div className="navigationButton" onClick={goToPreviousDay}>&lt;&lt;</div> : null}
              </div>
              <div className="date">
                <CustomDatePicker
                  selectedDate={selectedDate}
                  onChange={goToDay}
                />
              </div>
              <div className="navNext">
                {selectedDate.isBefore(today) ? <div className="navigationButton" onClick={goToNextDay}>&gt;&gt;</div> : null}
              </div>
            </h1>
          </div>
          <div className="row justify-content-center">
            <DailyEnergyUsageTable
              data={halfHourData}
              totals={totals}
              energyCalculator={energyCalculator}
            />
          </div>
          <div className="row">
            <div className="col-sm-3">Scale:&nbsp;
              <OptionLink dispatch={dispatch} type="SET_SCALE" payload="hour" selected={state.energyUsageLineGraphScale === 'hour'} text="Hour" />&nbsp;|&nbsp;
              <OptionLink dispatch={dispatch} type="SET_SCALE" payload="halfHour" selected={state.energyUsageLineGraphScale === 'halfHour'} text="Half Hour" />&nbsp;|&nbsp;
              <OptionLink dispatch={dispatch} type="SET_SCALE" payload="minute" selected={state.energyUsageLineGraphScale === 'minute'} text="Minute" />
            </div>
            <div className="col-sm-6">View:&nbsp;
              <OptionLink dispatch={dispatch} type="SET_VIEW" payload="nonCumulative" selected={state.energyUsageLineGraphView === 'nonCumulative'} text="Straight" />&nbsp;|&nbsp;
              <OptionLink dispatch={dispatch} type="SET_VIEW" payload="cumulative" selected={state.energyUsageLineGraphView === 'cumulative'} text="Cumulative" />
            </div>
          </div>
          <div className="row twenty-px-margin-top">
            <div className="col-md-10 offset-md-1 text-center">
              <EnergyUsageLineGraph
                scale={state.energyUsageLineGraphScale}
                view={state.energyUsageLineGraphView}
                minutePvData={minuteData}
                halfHourPvData={halfHourData}
                hourlyPvData={hourData}
              />
            </div>
          </div>
          <div className="row twenty-px-margin-top">
            <div className="col-sm-6">
              <LiveEnergyBarGraph minutePvData={minuteData[minuteData.length-1] ?? {}} />
            </div>
            <div className="col-sm-6">
              <GreenEnergyPercentageLineGraph halfHourPvData={halfHourData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;