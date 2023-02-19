export const formatDecimal = (number: number = 0): number => Math.round(number * 100) / 100;
export const convertJoulesToKwh = (joules: number = 0): number => formatDecimal((joules / 3600000));
export const formatToEuro = (amount: number): string => (amount ? `€${amount.toFixed(2)}` : '');