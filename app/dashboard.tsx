import moment from 'moment';
import React, { useReducer } from 'react';
import CustomDatePicker from './custom-date-picker';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import EnergyCostLineGraph from './energy-cost-line-graph';
import EnergyUsageLineGraph from './energy-usage-line-graph';
import GreenEnergyPercentageLineGraph from './green-energy-percentage-line-graph';
import * as dateUtils from './lib/date-utils';
import { isTouchScreen } from './lib/display-utils';
import LiveEnergyBarGraph from './live-energy-bar-graph';
import OptionLink from './option-link';
import { dashboardReducer, initialState } from './reducers/dashboardReducer';
import ResponsiveEnergyUsageTable from './responsive-energy-usage-table';
import { EnergyCalculator, Totals } from '../shared/energy-calculator';
import { MinutePVData, HalfHourlyPVData, HourlyPVData } from '../shared/pv-data';

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

  const isToday = selectedDate.isSame(today);

  return (
    <div className="container dashboard">
      <div className="row">
        <div className="col">
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
          <div className="row d-lg-block d-none">
            <div className="col">
              <DailyEnergyUsageTable
                data={halfHourData}
                totals={totals}
                energyCalculator={energyCalculator}
              />
            </div>
          </div>
          <div className="row d-lg-none">
            <div className="col">
              <ResponsiveEnergyUsageTable
                data={halfHourData}
                totals={totals}
                energyCalculator={energyCalculator}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <span className="title">Scale:</span>&nbsp;
              <OptionLink dispatch={dispatch} type="SET_SCALE" payload="hour" selected={state.energyUsageLineGraphScale === 'hour'} text="Hour" />&nbsp;|&nbsp;
              <OptionLink dispatch={dispatch} type="SET_SCALE" payload="halfHour" selected={state.energyUsageLineGraphScale === 'halfHour'} text="Half Hour" />&nbsp;|&nbsp;
              <OptionLink dispatch={dispatch} type="SET_SCALE" payload="minute" selected={state.energyUsageLineGraphScale === 'minute'} text="Minute" />
            </div>
            <div className="col-md-3">
              <span className="title">View:</span>&nbsp;
              <OptionLink dispatch={dispatch} type="SET_VIEW" payload="line" selected={state.energyUsageLineGraphView === 'line'} text="Line" />&nbsp;|&nbsp;
              <OptionLink dispatch={dispatch} type="SET_VIEW" payload="cumulative" selected={state.energyUsageLineGraphView === 'cumulative'} text="Cumulative Line" />
            </div>
          </div>
          <div className="row">
            <div className={isToday ? 'col energy-line-graph' : 'col-12 energy-line-graph'}>
              <EnergyUsageLineGraph
                scale={state.energyUsageLineGraphScale}
                view={state.energyUsageLineGraphView}
                minutePvData={minuteData}
                halfHourPvData={halfHourData}
                hourlyPvData={hourData}
              />
            </div>
            {isToday ? (
              <div className="col energy-line-graph">
                <EnergyCostLineGraph
                  view={state.energyUsageLineGraphView}
                  halfHourPvData={halfHourData}
                  hourlyPvData={hourData}
                  energyCalculator={energyCalculator}
                />
              </div>
            ) : null}
          </div>
          <div className='row'>
            {!isToday ? (
              <div className="col-sm-6 row-two-graph">
                <EnergyCostLineGraph
                  view={state.energyUsageLineGraphView}
                  halfHourPvData={halfHourData}
                  hourlyPvData={hourData}
                  energyCalculator={energyCalculator}
                />
              </div>
            ) : null}
            <div className="col-sm-6 row-two-graph">
              <GreenEnergyPercentageLineGraph
                scale={state.energyUsageLineGraphScale}
                minutePvData={minuteData}
                halfHourPvData={halfHourData}
                hourlyPvData={hourData}
              />
            </div>
            <div className={isToday ? 'col-sm-6 row-two-graph' : 'd-none'}>
              <LiveEnergyBarGraph minutePvData={minuteData[minuteData.length-1] ?? {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;