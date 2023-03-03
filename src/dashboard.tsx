import moment from 'moment';
import React, { useState } from 'react';
import CustomDatePicker from './custom-date-picker';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import EnergyUsageLineGraph, { View } from './energy-usage-line-graph';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import { MinutePVData, HalfHourlyPVData, HourlyPVData } from './lib/pv-service';

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

  return (
    <div className="container grid-container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9">
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
          <DailyEnergyUsageTable
            data={halfHourData}
            totals={totals}
            energyCalculator={energyCalculator}
          />
          <div>Scale:&nbsp;
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'hour' })}>Hour</a> |&nbsp;
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'halfHour' })}>Half Hour</a> |&nbsp;
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'minute' })}>Minute</a>
          </div>
          <div className="chart">
            <EnergyUsageLineGraph
              view={state.energyUsageLineGraphScale}
              minutePvData={minuteData}
              halfHourPvData={halfHourData}
              hourlyPvData={hourData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;