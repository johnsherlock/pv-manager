import * as numUtils from './num-utils';
import { HourlyUsageData } from './pv-service';

export interface EnergyCalculatorProps {
  readonly dayRate: number;
  readonly peakRate: number;
  readonly nightRate: number;
  readonly exportRate: number;
  readonly discountPercentage: number;
  readonly annualStandingCharge: number;
  readonly vatRate?: number;
}

export interface Totals {
  impTotal: number;
  genTotal: number;
  expTotal: number;
  conpTotal: number;
  greenEnergyPercentageTotal: number;
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
    conpTotal: 0,
    grossCostTotal: 0,
    greenEnergyPercentageTotal: 0,
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
  readonly annualStandingCharge: number;
  readonly dailyStandingCharge: number;
  readonly hourlyStandingCharge: number;
  readonly vatRate: number;

  constructor(props: EnergyCalculatorProps) {
    this.dayRate = props.dayRate;
    this.peakRate = props.peakRate;
    this.nightRate = props.nightRate;
    this.exportRate = props.exportRate;
    this.discountPercentage = 1 - props.discountPercentage;
    this.annualStandingCharge = props.annualStandingCharge;
    this.dailyStandingCharge = props.annualStandingCharge / 365;
    this.hourlyStandingCharge = this.dailyStandingCharge / 24;
    this.vatRate = props.vatRate ?? 1.09;
  }

  public calculateHourlyNetCostAtStandardRates = (hour = 0, dow: string, joules: number = 0) => {
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
  };

  public calculateDiscountedHourlyGrossCost = (hour: number = 0, dow: string, joules: number = 0) => {
    const netCostAtStandardRates = this.calculateHourlyNetCostAtStandardRates(hour, dow, joules);
    const grossCost = (netCostAtStandardRates * this.discountPercentage) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateHourlySaving = (hour: number = 0, dow: string, importedJoules: number = 0, consumedJoules: number = 0) => {
    const greenJoules = consumedJoules - importedJoules;
    return this.calculateDiscountedHourlyGrossCost(hour, dow, greenJoules);
  };

  public calculateHourlyGrossCostIncStdChgAndDiscount = (hour: number = 0, dow: string, joules: number = 0) => {
    const netCostAtStandardRates = this.calculateHourlyNetCostAtStandardRates(hour, dow, joules);
    const grossCost = ((netCostAtStandardRates * this.discountPercentage) + this.hourlyStandingCharge) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateSaturdaySaving = (hour = 0, dow: string, joules: number = 0) => {
    if (joules && dow === 'Sat' && hour >= 9 && hour <= 17) {
      const kWh = numUtils.convertJoulesToKwh(joules);
      const netSavingAtStandardRates = kWh * this.dayRate;
      const grossSavingAtDiscountedRates = (netSavingAtStandardRates * this.discountPercentage) * this.vatRate;
      return numUtils.formatDecimal(grossSavingAtDiscountedRates);
    }
    return 0;
  };

  public calculateDiscountedGrossCostExcludingStdChg = (netCostAtStandardRate: number = 0) => {
    const grossCost = (netCostAtStandardRate * this.discountPercentage) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateGrossCostIncStandingCharges = (netCost: number = 0) => {
    const grossCost = ((netCost * this.discountPercentage) + this.hourlyStandingCharge) * this.vatRate;
    return numUtils.formatDecimal(grossCost);
  };

  public calculateExportValue = (joules: number = 0) => {
    const kWh = numUtils.convertJoulesToKwh(joules);
    return numUtils.formatDecimal(kWh * this.exportRate);
  };

  public recalculateTotals = (data: HourlyUsageData[]) => {
    console.log('Recaculating totals');
    const totals = data.reduce((_totals, item) => {
      _totals.impTotal += (numUtils.formatDecimal(item.imp) || 0);
      _totals.genTotal += (numUtils.formatDecimal(item.gep) || 0);
      _totals.expTotal += (numUtils.formatDecimal(item.exp) || 0);
      _totals.conpTotal += (numUtils.formatDecimal(item.conp) || 0);
      _totals.greenEnergyPercentageTotal += (item.gepc || 50);
      _totals.grossCostTotal += this.calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp);
      _totals.grossSavingTotal += this.calculateHourlySaving(item.hr, item.dow, item.imp, item.conp);
      _totals.saturdayNetSavingTotal += this.calculateSaturdaySaving(item.hr, item.dow, item.imp);
      _totals.exportValueTotal += this.calculateExportValue(item.exp);
      return _totals;
    }, initialTotals());
    return {
      ...totals,
      greenEnergyPercentageTotal: numUtils.formatDecimal(totals.greenEnergyPercentageTotal / data.length, 1),
    };
  };

}