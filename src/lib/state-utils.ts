import moment from 'moment';
import * as dateUtils from './date-utils';
import { Totals } from './energy-calculator';
import { MinutePVData } from '../model/pv-data';

interface AppState {
  today: moment.Moment;
  selectedDate: moment.Moment;
  formattedSelectedDate: string;
  pvDataCache: Map<string, MinutePVData[]>;
  totals: Map<string, Totals>;
  energyUsageLineGraphScale: 'hour' | 'minute';
}

export const initialState = (): AppState => {
  const today: moment.Moment = moment().startOf('day');
  return {
    today: today,
    selectedDate: today,
    formattedSelectedDate: dateUtils.formatDate(today),
    pvDataCache: new Map(),
    totals: new Map(),
    energyUsageLineGraphScale: 'hour',
  };
};