import { useState } from 'react';
import { EnergyCalculator, Totals } from './lib/energy-calculator';
import * as numUtils from './lib/num-utils';
import { HalfHourlyPVData } from './lib/pv-service';

export interface DailyEnergyUsageTableProps {
  data: HalfHourlyPVData[];
  totals?: Totals;
  energyCalculator: EnergyCalculator;
}

const DailyEnergyUsageTable = ({ data, energyCalculator }: DailyEnergyUsageTableProps): JSX.Element => {

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
          {data?.map((item: HalfHourlyPVData, index: number) => (
            <div key={item.year + item.month + item.dayOfMonth + item.hour + item.minute} className={`table-row ${index % 2 === 0 ? 'table-primary' : ''}`}>
              <div className="table-cell time">{item.hour.toString().padStart(2, '0')}:{item.minute.toString().padStart(2, '0')}</div>
              <div className="table-cell imp">{item.importedKwH.toFixed(2)}</div>
              <div className="table-cell gep">{item.generatedKwH.toFixed(2)}</div>
              <div className="table-cell comp">{item.consumedKwH.toFixed(2)}</div>
              <div className="table-cell exp">{item.exportedKwH.toFixed(2)}</div>
              <div className="table-cell gepc">{item.greenEnergyPercentage}%</div>
              <div className="table-cell impCost">{numUtils.formatToEuro(energyCalculator.calculateGrossCostPerHalfHourIncStdChgAndDiscount(item.hour, item.dayOfWeek, item.importedKwH))}</div>
              <div className="table-cell saving">{numUtils.formatToEuro(energyCalculator.calculateSaving(item.hour, item.dayOfWeek, item.importedKwH, item.consumedKwH))}</div>
              <div className="table-cell expValue">{energyCalculator.calculateExportValue(item.exportedKwH)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="table-footer">
        <div className="table-row">
          <span className="table-cell">Total</span>
          <span className="table-cell">
            {energyCalculator.calculateTotalImportedKwH(data)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {energyCalculator.calculateTotalGeneratedKwH(data)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {energyCalculator.calculateTotalConsumedKwH(data)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {energyCalculator.calculateTotalExportedKwH(data)}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {energyCalculator.calculaterTotalGreenEnergyCoverage(data)}%
          </span>
          <span className="table-cell">
            {numUtils.formatToEuro(energyCalculator.calculateTotalGrossImportCost(data))}
            &nbsp;
            {data[0]?.dayOfWeek === 'Sat' ? `(${energyCalculator.calculateFreeImportGrossTotal(data)})` : ''}
          </span>
          <span className="table-cell">{numUtils.formatToEuro(energyCalculator.calculateTotalGrossSavings(data))}</span>
          <span className="table-cell">{numUtils.formatToEuro(energyCalculator.calculateTotalExportValue(data))}</span>
        </div>
      </div>
    </div>

  );
};

export default DailyEnergyUsageTable;