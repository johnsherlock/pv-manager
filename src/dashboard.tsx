import moment from 'moment';
import React, { useState } from 'react';
import CustomDatePicker from './custom-date-picker';
import DailyEnergyUsageTable from './daily-energy-usage-table';
import EnergyUsageLineGraph from './energy-usage-line-graph';
import * as dateUtils from './lib/date-utils';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import { PVData } from './lib/pv-service';

interface DashboardProps {
  selectedDate: moment.Moment;
  today: moment.Moment;
  minuteData?: PVData[];
  halfHourData?: PVData[];
  hourData?: PVData[];
  totals?: Totals;
  energyCalculator: EnergyCalculator;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToDay: (targetDate: moment.Moment) => void;
}


const Dashboard = (
  { selectedDate, today, minuteData, halfHourData, hourData, totals, energyCalculator, goToPreviousDay, goToNextDay, goToDay }:
  DashboardProps): JSX.Element => {

  const [state, setState] = useState({ energyUsageLineGraphScale: 'hour' as 'hour' | 'minute' });

  const pvData = state.energyUsageLineGraphScale === 'hour' ? hourData : minuteData;

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
            <a href="#" onClick={() => setState({ energyUsageLineGraphScale: 'minute' })}>Minute</a>
          </div>
          <div className="chart">
            <EnergyUsageLineGraph type={state.energyUsageLineGraphScale} data={pvData ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;