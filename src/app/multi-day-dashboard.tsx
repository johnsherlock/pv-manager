import moment from 'moment';
import React, { useReducer } from 'react';
import { CalendarScale } from './lib/state-utils';
import ResponsiveRangeEnergyUsageTable from './responsive-range-energy-usage-table';
import { EnergyCalculator } from '../shared/energy-calculator';
import { RangeTotals } from '../shared/pv-data';

interface MultiDayDashboardProps {
  dispatch: React.Dispatch<any>;
  startDate?: moment.Moment;
  endDate?: moment.Moment | null;
  totals?: RangeTotals;
  energyCalculator: EnergyCalculator;
  calendarScale: CalendarScale;
}

const MultiDayDashboard = ({ totals, energyCalculator, dispatch }: MultiDayDashboardProps): JSX.Element => {

  return (
    <div className="container dashboard">
      <div className="row">
        <div className="col">
          <div className="row">
            <div className="col">
              <ResponsiveRangeEnergyUsageTable
                totals={totals}
                energyCalculator={energyCalculator}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MultiDayDashboard;