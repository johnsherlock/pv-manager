export const formatDecimal = (number: number = 0): number => Math.round(number * 100) / 100;
export const convertJoulesToKwh = (joules: number = 0): number => ((joules / 3600000));
