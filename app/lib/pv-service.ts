import axios from 'axios';
import { calculateEnergyConsumption, calculateGreenEnergyPercentage } from './energy-utils';
import { EddiData } from '../../api/eddi-data';
import { MinutePVData } from '../model/pv-data';

export interface DailyEnergyUsageProps {
  data: MinutePVData[];
}

export const getPVDataForDate = async (formattedTargetDate: string): Promise<MinutePVData[]> => {
  console.log(`Retrieving per minute data for ${formattedTargetDate}`);
  const url = `https://jmcjm1731b.execute-api.eu-west-1.amazonaws.com/prod/minute-data?date=${formattedTargetDate}`;
  // const url = `http://localhost:3001/minute-data?date=${formattedTargetDate}`;
  try {
    const response = await axios.get(url);
    const data = await Promise.resolve(response.data as EddiData[]);
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