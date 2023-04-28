import axios from 'axios';
import { EddiData } from '../../shared/eddi-data';
import { mapEddiDataToMinutePVData } from '../../shared/energy-utils';
import { MinutePVData } from '../../shared/pv-data';

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
    return data.map(mapEddiDataToMinutePVData);
  } catch (error) {
    console.log('Error retrieving remote data', error);
    document.body.style.cursor = 'auto';
    return [];
  };
};