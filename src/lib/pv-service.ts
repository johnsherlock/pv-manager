import axios from 'axios';
import { convertJoulesToKwh } from './num-utils';
import { MinutePVData, EddiData, HourlyPVData, HalfHourlyPVData } from '../model/pv-data';

export interface DailyEnergyUsageProps {
  data: MinutePVData[];
}

const calculateEnergyConsumption = (
  importedJoules: number = 0,
  generatedJoules: number = 0,
  immersionDivertedJoules: number = 0,
  exportedJoules: number = 0): number => {

  return importedJoules + generatedJoules - immersionDivertedJoules - exportedJoules;
};

export const calculateGreenEnergyPercentage = (importedEnergy: number = 0, consumedEnergy: number = 0): number => {
  if (importedEnergy === 0) {
    return 100;
  }
  const greenEnergy = consumedEnergy - importedEnergy;
  if (greenEnergy <= 0) {
    return 0;
  }
  const percentage = Math.round((greenEnergy / consumedEnergy) * 100);
  return percentage;
};

export const getPVDataForDate = async (formattedTargetDate: string): Promise<MinutePVData[]> => {
  console.log(`Retrieving per minute data for ${formattedTargetDate}`);
  const url = `https://jmcjm1731b.execute-api.eu-west-1.amazonaws.com/prod/minute-data?date=${formattedTargetDate}`;
  // const url = `http://localhost:3001/minute-data?date=${formattedTargetDate}`;
  try {
    const response = await axios.get(url);
    const data = await Promise.resolve(response.data.U21494842 as EddiData[]);
    return data.map((item: EddiData): MinutePVData => {
      const conp = calculateEnergyConsumption(item.imp, item.gep, item.h1d, item.exp);
      const gepc = calculateGreenEnergyPercentage(item.imp, conp);
      return {
        year: item.yr,
        month: item.mon,
        dayOfMonth: item.dom,
        dayOfWeek: item.dow,
        hour: item.hr ?? 0,
        minute: item.min ?? 0,
        importedJoules: item.imp ?? 0,
        generatedJoules: item.gep ?? 0,
        exportedJoules: item.exp ?? 0,
        immersionDivertedJoules: item.h1d ?? 0,
        immersionBoostedJoules: item.h1b ?? 0,
        consumedJoules: conp,
        greenEnergyPercentage: gepc,
      };
    });
  } catch (error) {
    console.log('Error retrieving remote data', error);
    document.body.style.cursor = 'auto';
    return [];
  };
};

export const convertMinuteDataToHourlyData = (minuteData: MinutePVData[] = []): HourlyPVData[] => {
  const hourlyTotals: { [hour: number]: HourlyPVData } = {};

  for (const minuteItem of minuteData) {
    const {
      hour, importedJoules: importJoules, generatedJoules, exportedJoules: exportJoules,
      immersionDivertedJoules: immersionDivertedJoules, immersionBoostedJoules: immersionBoostedJoules, consumedJoules,
    } = minuteItem;

    hourlyTotals[hour] ??= {
      ...minuteItem,
      minute: 0,
      importedKwH: 0,
      generatedKwH: 0,
      exportedKwH: 0,
      immersionDivertedKwH: 0,
      immersionBoostedKwH: 0,
      immersionDivertedMins: 0,
      immersionBoostedMins: 0,
      consumedKwH: 0,
    };
    hourlyTotals[hour].importedKwH += convertJoulesToKwh(importJoules);
    hourlyTotals[hour].generatedKwH += convertJoulesToKwh(generatedJoules);
    hourlyTotals[hour].exportedKwH += convertJoulesToKwh(exportJoules);
    hourlyTotals[hour].immersionDivertedKwH += convertJoulesToKwh(immersionDivertedJoules);
    hourlyTotals[hour].immersionBoostedKwH += convertJoulesToKwh(immersionBoostedJoules);
    hourlyTotals[hour].immersionDivertedMins += immersionDivertedJoules > 0 ? 1 : 0;
    hourlyTotals[hour].immersionBoostedMins += immersionBoostedJoules > 0 ? 1 : 0;
    hourlyTotals[hour].consumedKwH += convertJoulesToKwh(consumedJoules);
  }
  // calculate the green energy percentage for each half hour
  for (const halfHour in hourlyTotals) {
    const { importedKwH: importKwH, consumedKwH } = hourlyTotals[halfHour];
    hourlyTotals[halfHour].greenEnergyPercentage = calculateGreenEnergyPercentage(importKwH, consumedKwH);
  }
  return Object.values(hourlyTotals);
};

export const convertMinuteDataToHalfHourlyData = (minuteData: MinutePVData[] = []): HalfHourlyPVData[] => {
  const halfHourlyTotals: { [halfHour: string]: HalfHourlyPVData } = {};

  for (const minuteItem of minuteData) {
    const {
      hour, minute, importedJoules: importJoules, generatedJoules, exportedJoules: exportJoules,
      immersionDivertedJoules: immersionDivertedJoules, immersionBoostedJoules: immersionBoostedJoules, consumedJoules,
    } = minuteItem;
    const halfHour = `${hour}:${minute < 30 ? '00' : '30'}`;
    halfHourlyTotals[halfHour] ??= {
      ...minuteItem,
      hour: parseInt(halfHour.split(':')[0]),
      minute: parseInt(halfHour.split(':')[1]) == 0 ? 0 : 30,
      importedKwH: 0,
      generatedKwH: 0,
      exportedKwH: 0,
      immersionDivertedKwH: 0,
      immersionBoostedKwH: 0,
      consumedKwH: 0,
      immersionDivertedMins: 0,
      immersionBoostedMins: 0,
      greenEnergyPercentage: 0,
    };
    halfHourlyTotals[halfHour].importedKwH += convertJoulesToKwh(importJoules);
    halfHourlyTotals[halfHour].generatedKwH += convertJoulesToKwh(generatedJoules);
    halfHourlyTotals[halfHour].exportedKwH += convertJoulesToKwh(exportJoules);
    halfHourlyTotals[halfHour].immersionDivertedKwH += convertJoulesToKwh(immersionDivertedJoules);
    halfHourlyTotals[halfHour].immersionBoostedKwH += convertJoulesToKwh(immersionBoostedJoules);
    halfHourlyTotals[halfHour].immersionDivertedMins += immersionDivertedJoules > 0 ? 1 : 0;
    halfHourlyTotals[halfHour].immersionBoostedMins += immersionBoostedJoules > 0 ? 1 : 0;
    halfHourlyTotals[halfHour].consumedKwH += convertJoulesToKwh(consumedJoules);
    halfHourlyTotals[halfHour].greenEnergyPercentage += calculateGreenEnergyPercentage(importJoules, consumedJoules);
  }
  // calculate the green energy percentage for each half hour
  for (const halfHour in halfHourlyTotals) {
    const { importedKwH: imp, consumedKwH: conp } = halfHourlyTotals[halfHour];
    halfHourlyTotals[halfHour].greenEnergyPercentage = calculateGreenEnergyPercentage(imp, conp);
  }
  return Object.values(halfHourlyTotals);
};