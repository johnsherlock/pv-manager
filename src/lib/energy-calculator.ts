import * as numUtils from './num-utils';
import { PVData } from './pv-service';

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
  dayImpTotal: number;
  peakImpTotal: number;
  nightImpTotal: number;
  freeImpTotal: number;
  immersionTotal: number;
  immersionRunTime: number;
  // greenEnergyPercentageTotal: number;
  // grossCostTotal: number;
  // grossSavingTotal: number;
  // saturdayNetSavingTotal: number;
  // exportValueTotal: number;
}

const initialTotals = (): Totals => {
  return {
    impTotal: 0,
    genTotal: 0,
    expTotal: 0,
    conpTotal: 0,
    dayImpTotal: 0,
    peakImpTotal: 0,
    nightImpTotal: 0,
    freeImpTotal: 0,
    immersionRunTime: 0,
    immersionTotal: 0,
    // grossCostTotal: 0,
    // greenEnergyPercentageTotal: 0,
    // grossSavingTotal: 0,
    // saturdayNetSavingTotal: 0,
    // exportValueTotal: 0,
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
  readonly halfHourlyStandingCharge: number;
  readonly perMinuteStandingCharge: number;
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
    this.halfHourlyStandingCharge = this.hourlyStandingCharge / 2;
    this.perMinuteStandingCharge = this.halfHourlyStandingCharge / 30;
    this.vatRate = props.vatRate ?? 1.09;
  }

  public calculateNetCostAtStandardRates = (hour = 0, dow: string, kWh: number = 0, round: boolean = true) => {
    let multiplier = this.dayRate;

    if ((hour >= 0 && hour <= 8) || hour === 23) {
      multiplier = this.nightRate;
    } else if (hour >= 17 && hour < 19) {
      multiplier = this.peakRate;
    }

    if (dow === 'Sat' && hour >= 9 && hour < 17) {
      multiplier = 0;
    }

    const cost = kWh * multiplier;

    return round ? numUtils.formatDecimal(cost) : cost;
  };

  public calculateDiscountedCostIncludingVat = (hour: number = 0, dow: string, kWh: number = 0, round = true) => {
    const netCostAtStandardRates = this.calculateNetCostAtStandardRates(hour, dow, kWh, round);
    const grossCost = (netCostAtStandardRates * this.discountPercentage) * this.vatRate;
    return round ? numUtils.formatDecimal(grossCost) : grossCost;
  };

  public calculateSaving = (hour: number = 0, dow: string, importedkWh: number = 0, consumedkWh: number = 0, round = true) => {
    const greenkWh = consumedkWh - importedkWh;
    return this.calculateDiscountedCostIncludingVat(hour, dow, greenkWh, round);
  };

  public calculateGrossCostPerHourIncStdChgAndDiscount = (hour: number = 0, dow: string, kWh: number = 0, round = true) => {
    return this.calculateGrossCostIncStdChgAndDiscount(hour, dow, kWh, 'hr', round);
  };

  public calculateGrossCostPerHalfHourIncStdChgAndDiscount = (hour: number = 0, dow: string, kWh: number = 0, round = true) => {
    return this.calculateGrossCostIncStdChgAndDiscount(hour, dow, kWh, 'hhr', round);
  };

  public calculateGrossCostPerMinuteIncStdChgAndDiscount = (hour: number = 0, dow: string, kWh: number = 0, round = false) => {
    return this.calculateGrossCostIncStdChgAndDiscount(hour, dow, kWh, 'm', round);
  };

  public calculateGrossCostIncStdChgAndDiscount = (hour: number = 0, dow: string, kWh: number = 0, timeUnit: 'hr' | 'hhr' | 'm', round = true) => {
    const netCostAtStandardRates = this.calculateNetCostAtStandardRates(hour, dow, kWh, round);
    const standingCharge = timeUnit === 'hr' ? this.hourlyStandingCharge : timeUnit === 'hhr' ? this.halfHourlyStandingCharge : this.perMinuteStandingCharge;
    const grossCost = ((netCostAtStandardRates * this.discountPercentage) + standingCharge) * this.vatRate;
    return round ? numUtils.formatDecimal(grossCost) : grossCost;
  };

  public calculateSaturdaySaving = (hour = 0, dow: string, kWh: number = 0) => {
    if (kWh && dow === 'Sat' && hour >= 9 && hour <= 17) {
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

  public calculateDailyGrossImportTotal = (totals: Totals = initialTotals()) => {
    const discountedDayImportNetCost =
      (numUtils.convertJoulesToKwh(totals.dayImpTotal - totals.freeImpTotal) * this.dayRate) * this.discountPercentage;
    const discountedPeakImportNetCost = (numUtils.convertJoulesToKwh(totals.peakImpTotal) * this.peakRate) * this.discountPercentage;
    const discountedNightImportNetCost = (numUtils.convertJoulesToKwh(totals.nightImpTotal) * this.nightRate) * this.discountPercentage;
    const discountedNetImportTotal = discountedDayImportNetCost + discountedPeakImportNetCost + discountedNightImportNetCost;
    const grossImportTotal = (discountedNetImportTotal + this.dailyStandingCharge) * this.vatRate;
    return numUtils.formatToEuro(grossImportTotal);
  };

  public calculateFreeImportGrossTotal = (totals: Totals = initialTotals()) => {
    const freeImportGrossTotal = (numUtils.convertJoulesToKwh(totals.freeImpTotal) * this.dayRate) * this.vatRate;
    return numUtils.formatToEuro(freeImportGrossTotal);
  };

  public calculateDailyExportTotal = (totals: Totals = initialTotals()) => {
    const grossExportTotal = (numUtils.convertJoulesToKwh(totals.expTotal) * this.exportRate);
    return numUtils.formatToEuro(grossExportTotal);
  };

  public calculateDailySavingsGrossTotal = (totals: Totals = initialTotals()) => {

  };

  public recalculateTotals = (perMinuteData: PVData[]): Totals => {
    console.log('Recaculating totals');
    const totals: Totals = initialTotals();
    perMinuteData.forEach((item: PVData) => {
      totals.impTotal += item.imp ?? 0;
      totals.genTotal += item.gep ?? 0;
      totals.expTotal += item.exp ?? 0;
      totals.conpTotal += item.conp ?? 0;
      totals.immersionRunTime += (item.h1b || item.h1d) ? 1 : 0;
      totals.immersionTotal += item.h1d ?? 0;

      if (item.hr >= 17 && item.hr < 19) totals.peakImpTotal += item.imp ?? 0;
      else if ((item.hr >= 0 && item.hr < 8) || item.hr === 23) totals.nightImpTotal += item.imp ?? 0;
      else if (item.dow === 'Sat' && item.hr >= 9 && item.hr < 17) totals.freeImpTotal += item.imp ?? 0;
      else totals.dayImpTotal += item.imp ?? 0;
    });
    return {
      ...totals,
      impTotal: totals.peakImpTotal + totals.nightImpTotal + totals.dayImpTotal,
    };
  };

}