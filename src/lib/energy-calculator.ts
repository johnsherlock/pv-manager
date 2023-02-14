import * as numUtils from './num-utils';

export interface EnergyCalculatorProps {
  readonly dayRate: number;
  readonly peakRate: number;
  readonly nightRate: number;
  readonly exportRate: number;
  readonly discountPercentage: number;
  readonly standingCharge: number;
  readonly vatRate?: number;
}

export interface Totals {
  impTotal: number;
  genTotal: number;
  expTotal: number;
  grossCostTotal: number;
  grossSavingTotal: number;
  saturdayNetSavingTotal: number;
  exportValueTotal: number;
}

const initialTotals = (): Totals => {
  return {
    impTotal: 0,
    genTotal: 0,
    expTotal: 0,
    grossCostTotal: 0,
    grossSavingTotal: 0,
    saturdayNetSavingTotal: 0,
    exportValueTotal: 0,
  };
};

export class EnergyCalculator {
  readonly dayRate: number;
  readonly peakRate: number;
  readonly nightRate: number;
  readonly exportRate: number;
  readonly discountPercentage: number;
  readonly standingCharge: number;
  readonly hourlyStandingCharge: number;
  readonly vatRate: number;

  constructor(props: EnergyCalculatorProps) {
    this.dayRate = props.dayRate;
    this.peakRate = props.peakRate;
    this.nightRate = props.nightRate;
    this.exportRate = props.exportRate;
    this.discountPercentage = 1 - props.discountPercentage;
    this.standingCharge = props.standingCharge;
    this.hourlyStandingCharge = this.standingCharge / 24;
    this.vatRate = props.vatRate ?? 1.09;
  }


  public calculateHourlyNetCostAtStandardRates = (hour = 0, dow: string, joules: number) => {
    if (joules) {
      let multiplier = this.dayRate;

      if ((hour >= 0 && hour <= 8) || hour === 23) {
        multiplier = this.nightRate;
      } else if (hour >= 17 && hour < 19) {
        multiplier = this.peakRate;
      }

      if (dow === 'Sat' && hour >= 9 && hour < 17) {
        multiplier = 0;
      }

      const kWh = numUtils.convertJoulesToKwh(joules);
      const cost = kWh * multiplier;

      return numUtils.formatDecimal(cost);
    }
    return 0;
  };

  public calculateDiscountedHourlyGrossCost = (hour: number = 0, dow: string, joules: number) => {
    const netCostAtStandardRates = this.calculateHourlyNetCostAtStandardRates(hour, dow, joules);
    const grossCost = (netCostAtStandardRates * this.discountPercentage) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateHourlyGrossCostIncStdChgAndDiscount = (hour: number = 0, dow: string, joules: number) => {
    const netCostAtStandardRates = this.calculateHourlyNetCostAtStandardRates(hour, dow, joules);
    const grossCost = ((netCostAtStandardRates * this.discountPercentage) + this.hourlyStandingCharge) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateSaturdaySaving = (hour = 0, dow: string, joules: number) => {
    if (joules && dow === 'Sat' && hour >= 9 && hour <= 17) {
      const kWh = numUtils.convertJoulesToKwh(joules);
      const netSavingAtStandardRates = kWh * this.dayRate;
      const grossSavingAtDiscountedRates = (netSavingAtStandardRates * this.discountPercentage) * this.vatRate;
      return numUtils.formatDecimal(grossSavingAtDiscountedRates);
    }
    return 0;
  };

  public calculateDiscountedGrossCostExcludingStdChg = (netCostAtStandardRate: number) => {
    const grossCost = (netCostAtStandardRate * this.discountPercentage) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateGrossCostIncStandingCharges = (netCost: number) => {
    const grossCost = ((netCost * this.discountPercentage) + this.hourlyStandingCharge) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateExportValue = (joules: number) => {
    if (joules) {
      const kWh = numUtils.convertJoulesToKwh(joules);
      return numUtils.formatDecimal(kWh * this.exportRate);
    }
    return 0;
  };

  public recalculateTotals = (data: any[]) => {
    console.log('Recaculating totals');
    const totals = data.reduce((_totals, item) => {
      _totals.impTotal += (numUtils.formatDecimal(item.imp) || 0);
      _totals.genTotal += (numUtils.formatDecimal(item.gep) || 0);
      _totals.expTotal += (numUtils.formatDecimal(item.exp) || 0);
      _totals.grossCostTotal += this.calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp);
      _totals.grossSavingTotal += this.calculateDiscountedHourlyGrossCost(item.hr, item.dow, item.gep);
      _totals.saturdayNetSavingTotal += this.calculateSaturdaySaving(item.hr, item.dow, item.imp);
      _totals.exportValueTotal += this.calculateExportValue(item.exp);

      return _totals;
    }, initialTotals());
    return totals;
  };

}

export const DEFAULT_ENERGY_CALCULATOR = new EnergyCalculator({
  dayRate: 0.4673,
  peakRate: 0.5709,
  nightRate: 0.3434,
  exportRate: 0.1850,
  discountPercentage: 0.15,
  standingCharge: 0.7066,
});