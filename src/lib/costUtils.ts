import * as numUtils from './numUtils';

// export discounted rates
// export const dayRate = 0.4330;
// export const peakRate = 0.5289;
// export const nightRate = 0.3182;

// export 100% standard rates from bill
export const dayRate = 0.4673;
export const peakRate = 0.5709;
export const nightRate = 0.3434;

// export calculated 100% standard rates
// export const dayRate = 0.5094;
// export const peakRate = 0.6222;
// export const nightRate = 0.3742;

export const exportRate = 0.1850;

export const discount = 1 - 0.15;
export const standingCharge = 0.7066;
export const hourlyStandingCharge = standingCharge / 24;
export const vatRate = 1.09;

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

export const formatToEuro = (amount: number): string => (amount ? `€${amount.toFixed(2)}` : '');

export const calculateHourlyNetCostAtStandardRates = (hour = 0, dow: string, joules: number) => {
  if (joules) {
    let multiplier = dayRate;

    if ((hour >= 0 && hour <= 8) || hour === 23) {
      multiplier = nightRate;
    } else if (hour >= 17 && hour < 19) {
      multiplier = peakRate;
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

export const calculateDiscountedHourlyGrossCost = (hour: number = 0, dow: string, joules: number) => {
  const netCostAtStandardRates = calculateHourlyNetCostAtStandardRates(hour, dow, joules);
  const grossCost = (netCostAtStandardRates * discount) * vatRate;
  return numUtils.formatDecimal(grossCost);
};

export const calculateHourlyGrossCostIncStdChgAndDiscount = (hour: number = 0, dow: string, joules: number) => {
  const netCostAtStandardRates = calculateHourlyNetCostAtStandardRates(hour, dow, joules);
  const grossCost = ((netCostAtStandardRates * discount) + hourlyStandingCharge) * vatRate;
  return numUtils.formatDecimal(grossCost);
};

export const calculateSaturdaySaving = (hour = 0, dow: string, joules: number) => {
  if (joules && dow === 'Sat' && hour >= 9 && hour <= 17) {
    const kWh = numUtils.convertJoulesToKwh(joules);
    const netSavingAtStandardRates = kWh * dayRate;
    const grossSavingAtDiscountedRates = (netSavingAtStandardRates * discount) * vatRate;
    return numUtils.formatDecimal(grossSavingAtDiscountedRates);
  }
  return 0;
};

export const calculateDiscountedGrossCostExcludingStdChg = (netCostAtStandardRate: number) => {
  const grossCost = (netCostAtStandardRate * discount) * vatRate;
  return numUtils.formatDecimal(grossCost);
};

export const calculateGrossCostIncStandingCharges = (netCost: number) => {
  const grossCost = ((netCost * discount) + hourlyStandingCharge) * vatRate;
  return numUtils.formatDecimal(grossCost);
};

export const calculateExportValue = (joules: number) => {
  if (joules) {
    const kWh = numUtils.convertJoulesToKwh(joules);
    return numUtils.formatDecimal(kWh * exportRate);
  }
  return 0;
};

export const recalculateTotals = (data: any[]) => {
  console.log('Recaculating totals');
  const totals = data.reduce((_totals, item) => {
    _totals.impTotal += (numUtils.formatDecimal(item.imp) || 0);
    _totals.genTotal += (numUtils.formatDecimal(item.gep) || 0);
    _totals.expTotal += (numUtils.formatDecimal(item.exp) || 0);
    _totals.grossCostTotal += calculateHourlyGrossCostIncStdChgAndDiscount(item.hr, item.dow, item.imp);
    _totals.grossSavingTotal += calculateDiscountedHourlyGrossCost(item.hr, item.dow, item.gep);
    _totals.saturdayNetSavingTotal += calculateSaturdaySaving(item.hr, item.dow, item.imp);
    _totals.exportValueTotal += calculateExportValue(item.exp);

    return _totals;
  }, initialTotals());
  return totals;
};