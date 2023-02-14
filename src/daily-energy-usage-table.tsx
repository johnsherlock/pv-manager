import { EnergyCalculator, Totals } from './lib/energy-calculator';
import * as numUtils from './lib/num-utils';

export interface DailyEnergyUsageTableProps {
  data: any;
  totals: Totals;
  energyCalculator: EnergyCalculator;
}

const DailyEnergyUsageTable = ({ data, totals, energyCalculator }: DailyEnergyUsageTableProps): JSX.Element => {

  return (
    <div className="table">
      <div className="table-header">
        <div className="table-row">
          <div className="table-cell">Hour</div>
          <div className="table-cell">Imported kWh</div>
          <div className="table-cell">Cost</div>
          <div className="table-cell">Generated kWh</div>
          <div className="table-cell">Saving</div>
          <div className="table-cell">Exported kWh</div>
          <div className="table-cell">Value</div>
        </div>
      </div>
      <div className="table-container">
        <div className="table-body">
          {data?.map((item: any, index: number) => (
            <div key={item.yr + item.mon + item.dom + item.hr} className={`table-row ${index % 2 === 0 ? 'table-primary' : ''}`}>
              <div className="table-cell">{item.hr ? item.hr.toString().padStart(2, '0') : '00'}</div>
              <div className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(item.imp))}</div>
              <div className="table-cell">{numUtils.formatToEuro(energyCalculator.calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp)) ?? ''}</div>
              <div className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(item.gep)) ?? ''}</div>
              <div className="table-cell">{numUtils.formatToEuro(energyCalculator.calculateDiscountedHourlyGrossCost(item.hr, item.dow, item.gep))}</div>
              <div className="table-cell">{numUtils.formatDecimal(numUtils.convertJoulesToKwh(item.exp))}</div>
              <div className="table-cell">{numUtils.formatDecimal(energyCalculator.calculateExportValue(item.exp))}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="table-footer">
        <div className="table-row">
          <span className="table-cell">Total</span>
          <span className="table-cell">
            {numUtils.formatDecimal(
              numUtils.convertJoulesToKwh(totals.impTotal))}
            {' '}
            kWh
          </span>
          <span className="table-cell">
            {numUtils.formatToEuro(totals?.grossCostTotal)}
            &nbsp;
            {totals?.saturdayNetSavingTotal ? `(${numUtils.formatToEuro(energyCalculator.calculateDiscountedGrossCostExcludingStdChg(totals?.saturdayNetSavingTotal))})` : ''}
          </span>
          <span className="table-cell">
            {numUtils.formatDecimal(numUtils.convertJoulesToKwh(totals?.genTotal))}
            {' '}
            kWh
          </span>
          <span className="table-cell">{numUtils.formatToEuro(totals?.grossSavingTotal) || '€0.00'}</span>
          <span className="table-cell">
            {numUtils.formatDecimal(numUtils.convertJoulesToKwh(totals?.expTotal))}
            {' '}
            kWh
          </span>
          <span className="table-cell">{numUtils.formatToEuro(totals?.exportValueTotal) || '€0.00'}</span>
        </div>
      </div>
    </div>

  );
};

export default DailyEnergyUsageTable;