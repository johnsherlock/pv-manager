import { useState } from 'react';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import * as numUtils from './lib/num-utils';
import { HourlyUsageData } from './lib/pv-service';

export interface DailyEnergyUsageTableProps {
  data?: HourlyUsageData[];
  totals?: Totals;
  energyCalculator: EnergyCalculator;
}

const DailyEnergyUsageTable = ({ data, totals, energyCalculator }: DailyEnergyUsageTableProps): JSX.Element => {

  const [state, setState] = useState({ expanded: false });

  return (
    <div className="table">
      <div className="table-header">
        <div className="table-row">
          <div className="table-cell">
            <div><a href="#" onClick={() => setState({ expanded: !state.expanded })}>{state.expanded ? 'Collapse' : 'Expand'}</a></div>
            <div className={`${state.expanded ? 'show' : 'hide'}`}>Hour</div>
          </div>
          <div className="table-cell">Imported kWh</div>
          <div className="table-cell">Generated kWh</div>
          <div className="table-cell">Consumed kWh</div>
          <div className="table-cell">Exported kWh</div>
          <div className="table-cell">Consumed Energy Green</div>
          <div className="table-cell">Import Cost</div>
          <div className="table-cell">Green Energy Saving</div>
          <div className="table-cell">Export Value</div>
        </div>
      </div>
      <div className={`table-container ${state.expanded ? 'show' : 'hide'}`}>
        <div className="table-body">
          {data?.map((item: any, index: number) => (
            <div key={item.yr + item.mon + item.dom + item.hr} className={`table-row ${index % 2 === 0 ? 'table-primary' : ''}`}>
              <div className="table-cell">{item.hr ? item.hr.toString().padStart(2, '0') : '00'}</div>
              <div className="table-cell">{numUtils.convertJoulesToKwh(item.imp)}</div>
              <div className="table-cell">{numUtils.convertJoulesToKwh(item.gep)}</div>
              <div className="table-cell">{numUtils.convertJoulesToKwh(item.conp)}</div>
              <div className="table-cell">{numUtils.convertJoulesToKwh(item.exp)}</div>
              <div className="table-cell">{item.gepc}%</div>
              <div className="table-cell">{numUtils.formatToEuro(energyCalculator.calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp))}</div>
              <div className="table-cell">{numUtils.formatToEuro(energyCalculator.calculateHourlySaving(item.hr, item.dow, item.imp, item.conp))}</div>
              <div className="table-cell">{energyCalculator.calculateExportValue(item.exp)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="table-footer">
        <div className="table-row">
          <span className="table-cell">Total</span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.impTotal)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.genTotal)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.conpTotal)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.expTotal)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {totals?.greenEnergyPercentageTotal}%
          </span>
          <span className="table-cell">
            {numUtils.formatToEuro(totals?.grossCostTotal ?? 0)}
            &nbsp;
            {totals?.saturdayNetSavingTotal ? `(${numUtils.formatToEuro(energyCalculator.calculateDiscountedGrossCostExcludingStdChg(totals?.saturdayNetSavingTotal))})` : ''}
          </span>
          <span className="table-cell">{numUtils.formatToEuro(totals?.grossSavingTotal ?? 0)}</span>
          <span className="table-cell">{numUtils.formatToEuro(totals?.exportValueTotal ?? 0)}</span>
        </div>
      </div>
    </div>

  );
};

export default DailyEnergyUsageTable;