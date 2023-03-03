import * as numUtils from './num-utils';
import { MinutePVData, HalfHourlyPVData, calculateGreenEnergyPercentage } from './pv-service';

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
  grossSavingTotal: number;
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
    grossSavingTotal: 0,
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
    return greenkWh > 0 ? this.calculateDiscountedCostIncludingVat(hour, dow, greenkWh, round) : 0;
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

  public calculateExportValue = (exportKwH: number = 0) => {
    return numUtils.formatDecimal(exportKwH * this.exportRate);
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

  // public calculateFreeImportGrossTotal = (totals: Totals = initialTotals()) => {
  //   const freeImportGrossTotal = (numUtils.convertJoulesToKwh(totals.freeImpTotal) * this.dayRate) * this.vatRate;
  //   return numUtils.formatToEuro(freeImportGrossTotal);
  // };

  public calculateDailyExportTotal = (totals: Totals = initialTotals()) => {
    const grossExportTotal = (numUtils.convertJoulesToKwh(totals.expTotal) * this.exportRate);
    return numUtils.formatToEuro(grossExportTotal);
  };

  public calculateDailyGreenEnergyCoverage = (totals: Totals = initialTotals()) => {
    return numUtils.formatDecimal(100 - ((totals.impTotal/totals.conpTotal) * 100));
  };

  public calculateTotalImportedKwH = (pvData: HalfHourlyPVData[] = []) => {
    return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.importedKwH, 0));
  };

  public calculateTotalGeneratedKwH = (pvData: HalfHourlyPVData[] = []) => {
    return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.generatedKwH, 0));
  };

  public calculateTotalConsumedKwH = (pvData: HalfHourlyPVData[] = []) => {
    return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.consumedKwH, 0));
  };

  public calculateTotalExportedKwH = (pvData: HalfHourlyPVData[] = []) => {
    return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.exportedKwH, 0));
  };

  public calculateTotalImmersionDivertedKwH = (pvData: HalfHourlyPVData[] = []) => {
    return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.immersionDivertedKwH, 0));
  };

  public calculateTotalImmersionBoostedKwH = (pvData: HalfHourlyPVData[] = []) => {
    return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + (item.immersionBoostedKwH ?? 0), 0));
  };

  public calculateTotalImmersionDivertedMins = (pvData: HalfHourlyPVData[] = []) => {
    return pvData.reduce((acc, item) => acc + (item.immersionDivertedMins ?? 0), 0);
  };

  public calculateTotalImmersionBoostedMins = (pvData: HalfHourlyPVData[] = []) => {
    return pvData.reduce((acc, item) => acc + (item.immersionBoostedMins ?? 0), 0);
  };

  public calculateTotalGrossImportCost = (pvData: HalfHourlyPVData[] = []) => {
    return pvData.reduce((acc, item) => acc + this.calculateGrossCostPerHalfHourIncStdChgAndDiscount(item.hour, item.dayOfWeek, item.importedKwH), 0);
  };

  public calculateTotalGrossSavings = (pvData: HalfHourlyPVData[] = []) => {
    return pvData.reduce((acc, item) => acc + this.calculateSaving(item.hour, item.dayOfWeek, item.importedKwH, item.consumedKwH), 0);
  };

  public calculateTotalExportValue = (pvData: HalfHourlyPVData[] = []) => {
    return pvData.reduce((acc, item) => acc + this.calculateExportValue(item.exportedKwH), 0);
  };

  public calculateFreeImportGrossTotal = (pvData: HalfHourlyPVData[] = []) => {
    const freeImportedKwh: HalfHourlyPVData[] = pvData.filter(item => item.dayOfWeek === 'Sat' && item.hour >= 9 && item.hour < 17);
    return freeImportedKwh.reduce((acc, item) => acc + this.calculateDiscountedCostIncludingVat(item.hour, item.dayOfWeek, item.importedKwH), 0);
  };

  public calculaterTotalGreenEnergyCoverage = (pvData: HalfHourlyPVData[] = []) => {
    const totalImportedKwH = this.calculateTotalImportedKwH(pvData);
    const totalConsumedKwH = this.calculateTotalConsumedKwH(pvData);
    return calculateGreenEnergyPercentage(totalImportedKwH, totalConsumedKwH);
  };

  public recalculateTotals = (perMinuteData: MinutePVData[]): Totals => {
    console.log('Recaculating totals');
    const totals: Totals = initialTotals();
    perMinuteData.forEach((item: MinutePVData) => {
      totals.impTotal += item.importedJoules ?? 0;
      totals.genTotal += item.generatedJoules ?? 0;
      totals.expTotal += item.exportedJoules ?? 0;
      totals.conpTotal += item.consumedJoules ?? 0;
      totals.immersionRunTime += (item.immersionBoostedJoules || item.immersionDivertedJoules) ? 1 : 0;
      totals.immersionTotal += item.immersionDivertedJoules ?? 0;
      totals.grossSavingTotal += this.calculateSaving(
        item.hour, item.dayOfWeek, item.importedJoules, item.consumedJoules, false);

      if (item.hour >= 17 && item.hour < 19) totals.peakImpTotal += item.importedJoules ?? 0;
      else if ((item.hour >= 0 && item.hour < 8) || item.hour === 23) totals.nightImpTotal += item.importedJoules ?? 0;
      else if (item.dayOfWeek === 'Sat' && item.hour >= 9 && item.hour < 17) totals.freeImpTotal += item.importedJoules ?? 0;
      else totals.dayImpTotal += item.importedJoules ?? 0;
    });
    return {
      ...totals,
      impTotal: totals.peakImpTotal + totals.nightImpTotal + totals.dayImpTotal,
    };
  };

}