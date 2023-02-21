export const formatDecimal = (number: number = 0, decimalPlaces: number = 2): number => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
};

export const convertJoulesToKwh = (joules: number = 0): number => formatDecimal((joules / 3600000));

export const formatToEuro = (amount: number = 0): string => `€${amount.toFixed(2)}`;