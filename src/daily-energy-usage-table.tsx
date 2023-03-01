import { useState } from 'react';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import * as numUtils from './lib/num-utils';
import { PVData } from './lib/pv-service';

export interface DailyEnergyUsageTableProps {
  data?: PVData[];
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
          <div className="table-cell">Green Energy Coverage</div>
          <div className="table-cell">Import Cost</div>
          <div className="table-cell">Green Energy Saving</div>
          <div className="table-cell">Export Value</div>
        </div>
      </div>
      <div className={`table-container ${state.expanded ? 'show' : 'hide'}`}>
        <div className="table-body">
          {data?.map((item: any, index: number) => (
            <div key={item.yr + item.mon + item.dom + item.hr + item.min} className={`table-row ${index % 2 === 0 ? 'table-primary' : ''}`}>
              <div className="table-cell time">{item.hr.toString().padStart(2, '0')}:{item.min.toString().padStart(2, '0')}</div>
              <div className="table-cell imp">{item.imp.toFixed(2)}</div>
              <div className="table-cell gep">{item.gep.toFixed(2)}</div>
              <div className="table-cell comp">{item.conp.toFixed(2)}</div>
              <div className="table-cell exp">{item.exp.toFixed(2)}</div>
              <div className="table-cell gepc">{item.gepc}%</div>
              <div className="table-cell impCost">{numUtils.formatToEuro(energyCalculator.calculateGrossCostPerHalfHourIncStdChgAndDiscount(item.hr, item.dow, item.imp))}</div>
              <div className="table-cell saving">{numUtils.formatToEuro(energyCalculator.calculateSaving(item.hr, item.dow, item.imp, item.conp))}</div>
              <div className="table-cell expValue">{energyCalculator.calculateExportValue(item.exp)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="table-footer">
        <div className="table-row">
          <span className="table-cell">Total</span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.impTotal, true)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.genTotal, true)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.conpTotal, true)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.convertJoulesToKwh(totals?.expTotal, true)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {/* {totals?.greenEnergyPercentageTotal}% */}
            {100-numUtils.formatDecimal(totals?.impTotal!/totals?.conpTotal!)*100}%
          </span>
          <span className="table-cell">
            {energyCalculator.calculateDailyGrossImportTotal(totals)}
            &nbsp;
            {totals?.freeImpTotal ? `(${energyCalculator.calculateFreeImportGrossTotal(totals)})` : ''}
          </span>
          <span className="table-cell">0</span>
          <span className="table-cell">{energyCalculator.calculateDailyExportTotal(totals)}</span>
        </div>
      </div>
    </div>

  );
};

export default DailyEnergyUsageTable;