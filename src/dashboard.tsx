import moment from 'moment';
import React, { useEffect, useState } from 'react';
import CustomDatePicker from './custom-date-picker';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import EnergyUsageLineGraph, { View } from './energy-usage-line-graph';
import GreenEnergyPercentageLineGraph from './green-energy-percentage-line-graph';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import { MinutePVData, HalfHourlyPVData, HourlyPVData } from './lib/pv-service';
import LiveEnergyBarGraph from './live-energy-bar-graph';

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

  const [state, setState] = useState({ energyUsageLineGraphScale: 'hour' as View });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [darkMode]);

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
          <div>Scale:&nbsp;
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'hour' })}>Hour</a> |&nbsp;
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'halfHour' })}>Half Hour</a> |&nbsp;
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'minute' })}>Minute</a>
          </div>
          <div className="row twenty-px-margin-top">
            <div className="col-md-10 offset-md-1 text-center">
              <EnergyUsageLineGraph
                view={state.energyUsageLineGraphScale}
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