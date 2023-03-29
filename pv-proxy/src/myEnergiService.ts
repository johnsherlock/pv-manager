import { DateTime, IANAZone } from 'luxon';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';

export interface EddiData {
  yr: number;
  mon: number;
  dom: number;
  dow: 'Sun' | 'Mon' | 'Tues' | 'Wed' | 'Thurs' | 'Fri' | 'Sat';
  hr?: number;
  min?: number;
  imp?: number;
  gep?: number;
  exp?: number;
  h1d?: number;
  h1b?: number;
  pect1?: number;
  pect2?: number;
  hsk?: number;
  v1?: number;
  frq?: number;
}

export interface MiEnergiCredentials {
  serialNumber?: string;
  password?: string;
}

export class MyEnergiService {

  private myenergiAPIEndpoint: string;

  constructor(myenergiAPIEndpoint: string) {
    this.myenergiAPIEndpoint = myenergiAPIEndpoint;
  }

  private validateCredentials(credentials: MiEnergiCredentials) {
    if (!credentials.serialNumber) {
      throw new Error('Missing serial number parameter');
    }
    if (!credentials.password) {
      throw new Error('Missing password parameter');
    }
  }

  private validateDateFormat(date: string) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(date)) {
      throw new Error('Invalid date format. Expected format is YYYY-MM-DD');
    }
  
    const parsedDate = DateTime.fromISO(date, { setZone: true });
    if (!parsedDate.isValid) {
      throw new Error(`Invalid date: ${parsedDate.invalidExplanation}`);
    }
  }
  
  private validateInputs(date: string, credentials: MiEnergiCredentials, locale: string) {
    if (!date) {
      throw new Error('Missing date parameter');
    }
    if (!IANAZone.isValidSpecifier(locale)) {
      throw new Error(`Invalid locale ${locale}`);
    }
    this.validateDateFormat(date);
    this.validateCredentials(credentials);
  }
  
  public async getEddiData(date: string, credentials: MiEnergiCredentials, locale: string = 'Europe/London'): Promise<EddiData[]> {
    console.log('Getting data for', date);
    this.validateInputs(date, credentials, locale);
    
    const dateTime = DateTime.fromISO(date, { zone: locale });
    const offsetInHours = dateTime.offset / 60;

    console.log('Offset in hours', offsetInHours);
    const minutesInDay = 1440;
    let adjustedDateTime = dateTime.minus({ hours: offsetInHours });
    const url = `${this.myenergiAPIEndpoint}/cgi-jday-E${credentials.serialNumber}-${adjustedDateTime.toISODate()}-${adjustedDateTime.hour}-${adjustedDateTime.minute}-${minutesInDay}`;

    console.log('Fetching data from', url);

    const digestAuth = new AxiosDigestAuth({ password: credentials.password!, username: credentials.serialNumber! });
  
    const response = await digestAuth.request({
      headers: { Accept: 'application/json' },
      method: 'GET',
      url,
    });

    const eddiData = response.data[`U${credentials.serialNumber}`] as EddiData[];

    return this.adjustEddiDataForTimeZoneAndApplyDefaults(eddiData, dateTime);
  }

  private adjustEddiDataForTimeZoneAndApplyDefaults(eddiData: EddiData[], dateTime: DateTime): EddiData[] {
    const offsetInHours = dateTime.offset / 60;    
    console.log(`Timezone offset ${offsetInHours} hours`);
    return eddiData.map((data) => {
      // adjust the hour for the timezone and ensure both hr and min are set
      data.hr = (data.hr ?? 0) + offsetInHours;
      data.hr %= 24;
      if (data.hr < 0) {
        data.hr += 24;
      }
      data.min = data.min ?? 0;
      return data;
    });
  }
} 

