import axios from 'axios';

export interface DailyEnergyUsageProps {
  data: any;
}

export interface HourlyUsageData {
  'yr': number;
  'mon': number;
  'dom': number;
  'dow': 'Sun' | 'Mon' | 'Tues' | 'Wed' | 'Thurs' | 'Fri' | 'Sat';
  'hr': number;
  'min': number;
  'imp'?: number;
  'gep'?: number;
  'pect1'?: number;
  'pect2'?: number;
  'hsk?': number;
  'v1'?: number;
  'frq'?: number;
}

export const getHourlyUsageDataForDate = async (formattedTargetDate: string): Promise<HourlyUsageData[]> => {
  console.log(`Retrieving data for ${formattedTargetDate}`);
  const url = `http://localhost:3001/hour-data?date=${formattedTargetDate}`;
  try {
    const response = await axios.get(url);
    return await Promise.resolve(response.data.U21494842 as HourlyUsageData[]);
  } catch (error) {
    console.log('Error retrieving remote data', error);
    document.body.style.cursor = 'auto';
    return [];
  };
};